// script.js — Unified front-end controller (homepage, branch page, search page, subject modal)
// Assumes data/materials.json exists and follows Option 2 (materials is an array of {type,title,file}).
// Also tolerant of placeholder/older shapes (empty objects, strings).

/* ------------- Helpers ------------- */

const $ = id => document.getElementById(id);

async function loadJSON(path = "data/materials.json") {
  try {
    const res = await fetch(path);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.error("Failed to load JSON:", e);
    return {};
  }
}

function createEl(tag, opts = {}, ...children) {
  const el = document.createElement(tag);
  for (const k in opts) {
    if (k === "class") el.className = opts[k];
    else if (k === "html") el.innerHTML = opts[k];
    else if (k === "click") el.addEventListener("click", opts[k]);
    else el.setAttribute(k, opts[k]);
  }
  children.forEach(ch => {
    if (!ch) return;
    if (typeof ch === "string") el.appendChild(document.createTextNode(ch));
    else el.appendChild(ch);
  });
  return el;
}

/* ------------- Modal (popup) ------------- */
function ensureModal() {
  let modal = document.getElementById("lmh-modal");
  if (modal) return modal;
  modal = createEl("div", { id: "lmh-modal", class: "lmh-modal" });
  modal.innerHTML = `
    <div class="lmh-modal-inner">
      <button id="lmh-modal-close" class="lmh-modal-close">✕</button>
      <div id="lmh-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#lmh-modal-close").addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  });
  return modal;
}

function openSubjectModal(subjectCode, subjectData) {
  const modal = ensureModal();
  const body = modal.querySelector("#lmh-modal-body");
  body.innerHTML = "";

  // Subject title
  const h2 = document.createElement("h2");
  h2.textContent = subjectData.name + " (" + subjectCode + ")";
  body.appendChild(h2);

  // Branch & year
  const p = document.createElement("p");
  p.style.color = "#666";
  p.textContent =
    (subjectData.materials?.branch || "") +
    " • " +
    (subjectData.materials?.year || "");
  body.appendChild(p);

  const files = subjectData.materials?.files;

  if (!files) {
    body.innerHTML += "<p>No materials uploaded yet.</p>";
  } else {

    // NOTES PDF
    if (files.notes) {
      files.notes.forEach(note => {
        const a = document.createElement("a");
        a.href = note.file;
        a.target = "_blank";
        a.textContent = "📄 " + note.title;
        a.style.display = "block";
        a.style.margin = "10px 0";
        body.appendChild(a);
      });
    }

    // QUESTION PAPERS
    if (files.questionPapers) {
      files.questionPapers.forEach(q => {
        const a = document.createElement("a");
        a.href = q.file;
        a.target = "_blank";
        a.textContent = "📝 " + q.title;
        a.style.display = "block";
        body.appendChild(a);
      });
    }

    // VIDEOS
    if (files.videos) {
      files.videos.forEach(v => {
        const a = document.createElement("a");
        a.href = v.url;
        a.target = "_blank";
        a.textContent = "🎥 " + v.title;
        a.style.display = "block";
        body.appendChild(a);
      });
    }
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}



/* ------------- Rendering helpers ------------- */
function renderBranchCards(branches, container) {
  container.innerHTML = "";
  branches.forEach(b => {
    const card = createEl("div", { class: "nav-card" }, b);
    card.addEventListener("click", () => {
      window.location.href = `branch.html?branch=${encodeURIComponent(b)}`;
    });
    container.appendChild(card);
  });
}

function renderMaterialPreviewItem(item) {
  // small preview card used on homepage/search
  const code = item.code || item.subjectCode || item.id || "";
  const title = item.name || item.subjectName || item.title || "Subject";
  const branch = item.branch || "";
  const year = item.year || "";
  const card = createEl("div", { class: "material-card" });
  card.innerHTML = `
    <h3>${title} <small style="font-size:12px;color:#666">(${code})</small></h3>
    <p>${branch} • ${year}</p>
    <div class="material-actions"></div>
  `;
  const actions = card.querySelector(".material-actions");
  const openBtn = createEl("a", { class: "btn small", href: "#" }, "Open");
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openSubjectModal(code, item);
  });
  actions.appendChild(openBtn);
  return card;
}

/* ------------- Page initializers ------------- */

async function initHomePage() {
  const nav = $("navigation");
  if (!nav) return;
  const data = await loadJSON();

  // branches keys from data
  const branches = Object.keys(data).sort();
  renderBranchCards(branches, nav);

  // show some recent materials (flatten subjects across branches/year)
  const materialsContainer = $("materials");
  if (materialsContainer) {
    materialsContainer.innerHTML = "";
    const flat = [];
    for (const branch of Object.keys(data)) {
      const years = data[branch];
      for (const y of Object.keys(years)) {
        const yearObj = years[y];
        for (const code of Object.keys(yearObj)) {
          const subj = yearObj[code];
          subj.subjectCode = code;
          subj.branch = branch;
          subj.year = y + " Year";
          flat.push(subj);
        }
      }
    }
    // show up to 8
    flat.slice(0, 8).forEach(s => materialsContainer.appendChild(renderMaterialPreviewItem(s)));
  }

  // search form redirects to search.html?q=...
  const searchForm = document.querySelector("#search-form") || document.querySelector("form[action='search.html']");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      // Allow normal submit (it will navigate to search.html?q=...)
      // But ensure input is not empty
      const input = searchForm.querySelector("input[name='q']") || searchForm.querySelector("input[type='search']");
      if (input && input.value.trim() === "") {
        e.preventDefault();
        input.focus();
      }
    });
  }
}

async function initBranchPage() {
  const branchNameEl = $("branch-name");
  if (!branchNameEl) return;
  const params = new URLSearchParams(window.location.search);
  const branch = params.get("branch");
  if (!branch) {
    branchNameEl.textContent = "Branch";
    return;
  }
  const data = await loadJSON();
  branchNameEl.textContent = `${branch} Department`;

  // Year buttons
  const yearOptions = $("year-options");
  const subjectsSection = $("subjects-section");
  const subjectList = $("subject-list");
  if (!yearOptions) return;
  yearOptions.innerHTML = "";
  // We show years 1..4
  ["1st Year", "2nd Year", "3rd Year", "4th Year"].forEach(yLabel => {
    const btn = createEl("div", { class: "nav-card" }, yLabel);
    btn.addEventListener("click", () => {
      // show subjects for this branch and year
      subjectList.innerHTML = "";
      const yearKey = yLabel.split(" ")[0] === "1st" ? "1" : (yLabel.split(" ")[0] === "2nd" ? "2" : (yLabel.split(" ")[0] === "3rd" ? "3" : "4"));
      const branchData = data[branch];
      if (!branchData || !branchData[yearKey]) {
        // nothing to show — keep empty (per your request: don't show no-materials msg)
        subjectsSection.style.display = "block";
        return;
      }
      const yearObj = branchData[yearKey];
      for (const code of Object.keys(yearObj)) {
        const s = yearObj[code];
        s.subjectCode = code;
        s.branch = branch;
        s.year = `${yLabel}`;
        const card = createEl("div", { class: "material-card" });
        card.innerHTML = `<h3>${s.name}</h3><p style="color:#666">${code}</p>`;
        const open = createEl("button", { class: "btn small" }, "Open");
        open.addEventListener("click", () => openSubjectModal(code, s));
        card.appendChild(open);
        subjectList.appendChild(card);
      }
      subjectsSection.style.display = "block";
      subjectList.scrollIntoView({ behavior: "smooth" });
    });
    yearOptions.appendChild(btn);
  });
}

async function initSearchPage() {
  const resultsContainer = $("search-results");
  const queryText = $("query-text");
  if (!resultsContainer) return;
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").trim();
  if (queryText) queryText.textContent = q;

  const data = await loadJSON();
  const flat = [];
  for (const branch of Object.keys(data)) {
    const years = data[branch];
    for (const y of Object.keys(years)) {
      const yearObj = years[y];
      for (const code of Object.keys(yearObj)) {
        const subj = yearObj[code];
        flat.push({
          code,
          name: subj.name,
          branch,
          year: y,
          raw: subj
        });
      }
    }
  }

  const qLower = q.toLowerCase();
  const matches = flat.filter(it =>
    it.code.toLowerCase().includes(qLower) ||
    (it.name && it.name.toLowerCase().includes(qLower)) ||
    (it.branch && it.branch.toLowerCase().includes(qLower)) ||
    (it.year && (`${it.year}`.toLowerCase().includes(qLower)))
  );

  resultsContainer.innerHTML = "";
  if (matches.length === 0) {
    resultsContainer.innerHTML = `<p style="color:#666">No results for "${q}".</p>`;
    return;
  }

  matches.forEach(m => {
    const card = createEl("div", { class: "material-card" });
    card.innerHTML = `<h3>${m.name}<small style="font-size:12px;color:#666"> (${m.code})</small></h3>
                      <p>${m.branch} • ${m.year} Year</p>`;
    const open = createEl("button", { class: "btn small" }, "Open");
    open.addEventListener("click", () => {
      // load subject raw data and open modal
      const subjRaw = m.raw;
      subjRaw.subjectCode = m.code;
      subjRaw.branch = m.branch;
      subjRaw.year = `${m.year} Year`;
      openSubjectModal(m.code, subjRaw);
    });
    card.appendChild(open);
    resultsContainer.appendChild(card);
  });
}

async function initSubjectPageFallback() {
  // If user wants a dedicated subject.html page, we will still support it.
  const resources = $("resources");
  if (!resources) return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) {
    $("subject-title").textContent = "No subject specified";
    return;
  }
  const data = await loadJSON();
  // find subject by code
  let found = null;
  for (const branch of Object.keys(data)) {
    for (const y of Object.keys(data[branch])) {
      if (data[branch][y][code]) {
        found = Object.assign({ subjectCode: code, branch, year: `${y} Year` }, data[branch][y][code]);
        break;
      }
    }
    if (found) break;
  }
  if (!found) {
    $("subject-title").textContent = "Subject not found";
    return;
  }
  $("subject-title").textContent = `${found.name} (${code})`;
  // Render materials in resources container (reuse modal renderer style)
  resources.innerHTML = "";
  // ensure materials array
  let mats = [];
  if (Array.isArray(found.materials)) mats = found.materials;
  else if (found.materials && typeof found.materials === "object") {
    for (const t of Object.keys(found.materials)) {
      const v = found.materials[t];
      if (!v) continue;
      if (Array.isArray(v)) v.forEach(x => mats.push({ type: t, title: x.split("/").pop(), file: x }));
      else mats.push({ type: t, title: (typeof v === "string" ? v.split("/").pop() : t), file: v });
    }
  }
  if (mats.length === 0) {
    resources.appendChild(createEl("p", { class: "muted" }, "No materials added yet."));
    return;
  }
  const grid = createEl("div", { class: "resources-grid" });
  mats.forEach(m => {
    const rc = createEl("div", { class: "resource-card" });
    rc.innerHTML = `<h4>${m.type || ""} - ${m.title || ""}</h4>`;
    if (m.file && m.file.startsWith("http")) {
      rc.appendChild(createEl("p", {}, createEl("a", { href: m.file, target: "_blank" }, "Open")));
    } else if (m.file) {
      rc.appendChild(createEl("p", {}, createEl("a", { href: m.file, download: true }, "Download")));
    } else rc.appendChild(createEl("p", { class: "muted" }, "No file"));
    grid.appendChild(rc);
  });
  resources.appendChild(grid);
}

function initRevisionPage() {
  const form = $("revision-form");
  const contentDiv = $("revision-content");
  const select = $("topic-select");

  // Ensure all elements exist
  if (!form || !contentDiv || !select) {
    console.error("Revision page elements not found");
    return;
  }

  const revisionData = {
    'advanced-web-technology': `
      <div class="revision-container">
        <div class="revision-header">
          <h3>📚 Last-Minute Revision: Advanced Web Technology</h3>
          <p class="revision-subtitle">Complete study guide with summary, formulas, and practice questions</p>
        </div>

        <div class="revision-grid">
          <div class="revision-card">
            <div class="card-header">
              <h4>📖 1. One-Page Summary</h4>
            </div>
            <div class="card-content">
              <div class="concept-item">
                <strong>HTML5</strong>: Markup language for web structure; new elements like &lt;article&gt;, &lt;section&gt;, &lt;nav&gt;; semantic tags improve SEO and accessibility.
              </div>
              <div class="concept-item">
                <strong>CSS3</strong>: Styling language; features include flexbox, grid, animations, media queries for responsive design; selectors like :nth-child(), pseudo-elements ::before.
              </div>
              <div class="concept-item">
                <strong>JavaScript (ES6+)</strong>: Scripting for interactivity; key concepts: variables (let/const), arrow functions, promises/async-await, DOM manipulation (getElementById, addEventListener).
              </div>
              <div class="concept-item">
                <strong>AJAX & Fetch API</strong>: Asynchronous requests; XMLHttpRequest or fetch() for dynamic content loading without page reload.
              </div>
              <div class="concept-item">
                <strong>REST APIs</strong>: Architectural style; HTTP methods (GET, POST, PUT, DELETE); stateless, resource-based (e.g., /users/1).
              </div>
              <div class="concept-item">
                <strong>Web Security</strong>: HTTPS for encryption; CORS for cross-origin requests; XSS prevention with input sanitization; CSRF tokens.
              </div>
              <div class="concept-item">
                <strong>Progressive Web Apps (PWAs)</strong>: Offline-capable apps; service workers for caching, web app manifests for installability.
              </div>
              <div class="concept-item">
                <strong>Frameworks/Libraries</strong>: React (component-based), Angular (MVC), Vue.js; tools like Webpack for bundling, Babel for transpilation.
              </div>
            </div>
          </div>

          <div class="revision-card">
            <div class="card-header">
              <h4>⚡ 2. Key Syntax & Formulas</h4>
            </div>
            <div class="card-content">
              <p class="formula-note">Essential syntax patterns and code snippets:</p>
              <div class="formula-item">
                <strong>CSS Flexbox</strong>: <code>display: flex; justify-content: center; align-items: center;</code> – Centers content horizontally and vertically.
              </div>
              <div class="formula-item">
                <strong>CSS Grid</strong>: <code>display: grid; grid-template-columns: 1fr 2fr;</code> – Creates responsive layouts with fractions.
              </div>
              <div class="formula-item">
                <strong>JavaScript Promise</strong>: <code>fetch(url).then(response => response.json()).catch(error => console.error(error))</code> – Handles async operations.
              </div>
              <div class="formula-item">
                <strong>REST Endpoint</strong>: <code>GET /api/users</code> – Retrieves user data; use for read operations.
              </div>
            </div>
          </div>

          <div class="revision-card">
            <div class="card-header">
              <h4>❓ 3. Important Questions</h4>
            </div>
            <div class="card-content">
              <div class="question-section">
                <h5>Short-Answer Questions (2-3 sentences each)</h5>
                <div class="question-item">
                  <strong>Q:</strong> Explain the difference between HTML5 semantic elements and div tags.<br>
                  <span class="answer">Semantic elements like &lt;header&gt; provide meaning to content for better accessibility and SEO, while &lt;div&gt; is generic.</span>
                </div>
                <div class="question-item">
                  <strong>Q:</strong> What is CORS, and why is it important?<br>
                  <span class="answer">Cross-Origin Resource Sharing allows web apps to request resources from different domains; prevents unauthorized access for security.</span>
                </div>
                <div class="question-item">
                  <strong>Q:</strong> Describe the role of service workers in PWAs.<br>
                  <span class="answer">Service workers enable offline functionality by caching resources and intercepting network requests.</span>
                </div>
              </div>

              <div class="question-section">
                <h5>Long-Answer Questions (5-7 sentences each)</h5>
                <div class="question-item">
                  <strong>Q:</strong> Discuss how AJAX improves user experience in web applications. Provide an example.<br>
                  <span class="answer">AJAX allows partial page updates without full reloads, making apps faster and more interactive. For example, in a chat app, new messages load dynamically via fetch(). It uses asynchronous requests to server, reducing latency. However, it requires handling errors and loading states. Overall, it enhances responsiveness compared to traditional form submissions.</span>
                </div>
                <div class="question-item">
                  <strong>Q:</strong> Explain the principles of REST APIs and give an example of a CRUD operation.<br>
                  <span class="answer">REST is stateless, uses HTTP methods for resources. For CRUD: Create (POST /users), Read (GET /users/1), Update (PUT /users/1), Delete (DELETE /users/1). It promotes scalability and simplicity. APIs return JSON/XML data. Clients interact via URLs, not sessions.</span>
                </div>
              </div>

              <div class="question-section">
                <h5>Coding Problems</h5>
                <div class="question-item">
                  <strong>Q:</strong> Write a JavaScript function using fetch() to get data from a REST API and handle errors.<br>
                  <div class="code-answer">
                    <code>
                      async function getData() {<br>
                      &nbsp;&nbsp;try {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;const response = await fetch('https://api.example.com/data');<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;if (!response.ok) throw new Error('Network error');<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;const data = await response.json();<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;console.log(data);<br>
                      &nbsp;&nbsp;} catch (error) {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;console.error(error);<br>
                      &nbsp;&nbsp;}<br>
                      }
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="revision-card">
            <div class="card-header">
              <h4>⏱️ 4. Timed Reading Mode</h4>
            </div>
            <div class="card-content">
              <p class="timing-note">Read each section in 2-3 minutes for a total of 10-15 minutes. Focus on bullets and examples.</p>
              <div class="timing-item">
                <strong>Summary</strong>: Scan bullets for core concepts <span class="time-badge">5 min</span>
              </div>
              <div class="timing-item">
                <strong>Key Concepts</strong>: Memorize syntax patterns <span class="time-badge">2 min</span>
              </div>
              <div class="timing-item">
                <strong>Questions</strong>: Review types and examples <span class="time-badge">5 min</span>
              </div>
              <div class="timing-item">
                <strong>Quick quiz</strong>: Cover and recall 3 key points from each section <span class="time-badge">3 min</span>
              </div>
            </div>
          </div>

          <div class="revision-card quiz-card">
            <div class="card-header">
              <h4>🧠 5. Quick Quiz</h4>
            </div>
            <div class="card-content">
              <p class="quiz-intro">Test yourself with these sample questions:</p>
              <div class="quiz-questions">
                <div class="quiz-item">1. What does AJAX stand for?</div>
                <div class="quiz-item">2. Name two HTTP methods used in REST APIs.</div>
                <div class="quiz-item">3. What is the purpose of CORS?</div>
                <div class="quiz-item">4. Give an example of a CSS3 feature for responsive design.</div>
                <div class="quiz-item">5. What does PWA stand for?</div>
              </div>
              
              <details class="quiz-answers">
                <summary>🔍 Show Answers</summary>
                <div class="answers-grid">
                  <div class="answer-item">1. Asynchronous JavaScript and XML</div>
                  <div class="answer-item">2. GET, POST (or PUT, DELETE)</div>
                  <div class="answer-item">3. To allow web apps to request resources from different domains securely</div>
                  <div class="answer-item">4. Media queries</div>
                  <div class="answer-item">5. Progressive Web App</div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    `
  };

  // Add form submit event listener
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log

    const topic = select.value;
    console.log("Selected topic:", topic); // Debug log

    if (topic && revisionData[topic]) {
      contentDiv.innerHTML = revisionData[topic];
      contentDiv.style.display = 'block';
      console.log("Revision content displayed"); // Debug log
    } else {
      contentDiv.innerHTML = '<p>Please select a valid topic.</p>';
      contentDiv.style.display = 'block';
      console.log("No valid topic selected"); // Debug log
    }
  });

  console.log("Revision page initialized successfully"); // Debug log
}

// Dark Mode functionality - Initialize immediately to prevent flash
(function () {
  // Apply theme immediately to prevent flash
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
})();

/* ------------- Bootstrap on DOMContentLoaded ------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Home
  if ($("navigation")) {
    initHomePage();
  }
  // Branch
  if ($("year-options")) {
    initBranchPage();
  }
  // Search page
  if ($("search-results")) {
    initSearchPage();
  }
  // Subject dedicated page fallback
  if ($("resources")) {
    initSubjectPageFallback();
  }
  // Revision page
  if ($("revision-form")) {
    initRevisionPage();
  }
});

// Logout button handler: clear session keys and redirect to login
(function attachLogoutHandler() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    // Clear known session keys (do not wipe unrelated localStorage)
    const keys = ['userType', 'userName', 'userUSN', 'userEmail', 'loginTime', 'lastUSN', 'rememberMe', 'savedUSN'];
    keys.forEach(k => localStorage.removeItem(k));
    // Optional: show a small confirmation then redirect
    try {
      btn.disabled = true;
      btn.textContent = 'Logging out...';
    } catch (e) { }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 250);
  });
})();

/* ------------- Minimal CSS for modal and cards (inject if not present) ------------- */
(function injectModalCSS() {
  if (document.getElementById("lmh-modal-style")) return;
  const css = `
  .lmh-modal { position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:9999; }
  .lmh-modal-inner { background:var(--card-bg); width:90%; max-width:880px; border-radius:12px; padding:18px; position:relative; max-height:85vh; overflow:auto; color:var(--text-color); transition: background 0.3s, color 0.3s; }
  .lmh-modal-close { position:absolute; right:12px; top:12px; background:var(--input-bg); color:var(--text-color); border:0; border-radius:6px; padding:6px 8px; cursor:pointer; transition: background 0.3s, color 0.3s; }
  .resource-grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap:12px; margin-top:12px; }
  .resource-card { background:var(--card-bg); color:var(--text-color); padding:12px; border-radius:8px; box-shadow:0 6px 18px var(--card-shadow); transition: background 0.3s, color 0.3s, box-shadow 0.3s; }
  .modal-header h2 { margin:0 0 6px 0; font-size:18px; }
  .modal-header p.muted { margin:0; color:#666; font-size:13px; }
  .btn.small { padding:6px 10px; background:#0d6efd; color:#fff; border-radius:6px; border:0; cursor:pointer; margin-top:10px; }
  .muted { color:#666; }
  
  /* Revision Page Styles */
  .revision-container { max-width: 1200px; margin: 0 auto; padding: 20px 0; }
  .revision-header { text-align: center; margin-bottom: 30px; }
  .revision-header h3 { font-size: 28px; color: var(--section-title); margin-bottom: 8px; }
  .revision-subtitle { color: var(--text-color); opacity: 0.8; font-size: 16px; margin: 0; }
  
  .revision-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
  
  .revision-card { 
    background: var(--card-bg); 
    border-radius: 12px; 
    box-shadow: 0 4px 12px var(--card-shadow); 
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s;
  }
  .revision-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px var(--card-shadow); }
  
  .card-header { 
    background: var(--btn-bg); 
    color: var(--btn-text); 
    padding: 16px 20px; 
    font-weight: 600;
  }
  .card-header h4 { margin: 0; font-size: 18px; }
  
  .card-content { padding: 20px; }
  
  .concept-item, .formula-item, .timing-item { 
    background: var(--input-bg); 
    padding: 12px 16px; 
    margin-bottom: 12px; 
    border-radius: 8px; 
    border-left: 4px solid var(--btn-bg);
    transition: background 0.3s;
  }
  
  .question-section { margin-bottom: 24px; }
  .question-section h5 { 
    color: var(--section-title); 
    margin-bottom: 16px; 
    font-size: 16px;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 8px;
  }
  
  .question-item { 
    background: var(--input-bg); 
    padding: 16px; 
    margin-bottom: 16px; 
    border-radius: 8px;
    border-left: 4px solid var(--link-color);
    transition: background 0.3s;
  }
  .question-item .answer { 
    display: block; 
    margin-top: 8px; 
    color: var(--text-color); 
    opacity: 0.9; 
    font-style: italic;
  }
  
  .code-answer { 
    background: #2d3748; 
    color: #e2e8f0; 
    padding: 16px; 
    border-radius: 6px; 
    margin-top: 8px; 
    font-family: 'Courier New', monospace; 
    font-size: 14px;
    overflow-x: auto;
  }
  
  .formula-note, .timing-note, .quiz-intro { 
    color: var(--text-color); 
    opacity: 0.8; 
    margin-bottom: 16px; 
    font-style: italic;
  }
  
  .time-badge { 
    background: var(--btn-bg); 
    color: var(--btn-text); 
    padding: 4px 8px; 
    border-radius: 12px; 
    font-size: 12px; 
    font-weight: 600; 
    float: right;
  }
  
  .quiz-card .card-header { background: #9f7aea; }
  
  .quiz-questions { margin-bottom: 20px; }
  .quiz-item { 
    background: var(--input-bg); 
    padding: 12px 16px; 
    margin-bottom: 8px; 
    border-radius: 6px;
    border-left: 4px solid #9f7aea;
    transition: background 0.3s;
  }
  
  .quiz-answers { 
    background: var(--input-bg); 
    border-radius: 8px; 
    padding: 16px;
    transition: background 0.3s;
  }
  .quiz-answers summary { 
    cursor: pointer; 
    font-weight: 600; 
    color: var(--section-title); 
    margin-bottom: 12px;
  }
  .quiz-answers[open] summary { margin-bottom: 16px; }
  
  .answers-grid { display: grid; gap: 8px; }
  .answer-item { 
    background: var(--card-bg); 
    padding: 10px 12px; 
    border-radius: 6px; 
    border-left: 3px solid #48bb78;
    transition: background 0.3s;
  }
  
  code { 
    background: var(--input-bg); 
    padding: 2px 6px; 
    border-radius: 4px; 
    font-family: 'Courier New', monospace; 
    font-size: 14px;
    color: var(--text-color);
  }
  
  @media (max-width: 768px) {
    .revision-grid { grid-template-columns: 1fr; }
    .revision-container { padding: 15px; }
    .card-content { padding: 16px; }
    .time-badge { float: none; display: inline-block; margin-left: 8px; }
  }
  `;
  const s = document.createElement("style");
  s.id = "lmh-modal-style";
  s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
})();

// Advanced Student Doubt-Solving Chatbot
(function () {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const windowEl = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const messagesEl = document.getElementById('chatbot-messages');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  // Check if all elements exist before proceeding
  if (!toggleBtn || !windowEl || !closeBtn || !messagesEl || !inputEl || !sendBtn) return;

  // Conversation context and state
  let conversationContext = {
    lastTopic: null,
    userConfusion: 0,
    askedForExample: false,
    currentSubject: null
  };

  // Toggle chat window
  toggleBtn.addEventListener('click', () => {
    windowEl.style.display = windowEl.style.display === 'flex' ? 'none' : 'flex';
  });

  // Close chat window
  closeBtn.addEventListener('click', () => {
    windowEl.style.display = 'none';
  });

  // Send message with typing indicator
  function sendMessage() {
    const message = inputEl.value.trim();
    if (!message) return;

    addMessage('user', message);
    inputEl.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate realistic response time
    setTimeout(() => {
      hideTypingIndicator();
      const responses = getBotResponse(message);

      // Send multiple messages if needed
      if (Array.isArray(responses)) {
        responses.forEach((response, index) => {
          setTimeout(() => addMessage('bot', response), index * 800);
        });
      } else {
        addMessage('bot', responses);
      }
    }, Math.random() * 1000 + 500); // 0.5-1.5 seconds
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function addMessage(sender, text) {
    const msgEl = document.createElement('div');
    msgEl.className = `chatbot-message ${sender}`;

    // Support HTML content for rich responses
    if (text.includes('<')) {
      msgEl.innerHTML = text;
    } else {
      msgEl.textContent = text;
    }

    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'chatbot-message bot typing-indicator';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = '<span>●</span><span>●</span><span>●</span>';
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
  }

  // Advanced Academic Response System
  function getBotResponse(message) {
    const lowerMsg = message.toLowerCase();

    // Detect confusion or frustration
    if (lowerMsg.includes('confused') || lowerMsg.includes('don\'t understand') ||
      lowerMsg.includes('help') || lowerMsg.includes('stuck')) {
      conversationContext.userConfusion++;
      return getConfusionResponse(message);
    }

    // Greeting responses
    if (lowerMsg.match(/^(hi|hello|hey|good morning|good evening)/)) {
      return getGreetingResponse();
    }

    // Subject-specific academic responses
    if (lowerMsg.includes('javascript') || lowerMsg.includes('js')) {
      conversationContext.currentSubject = 'javascript';
      return getJavaScriptResponse(message);
    }

    if (lowerMsg.includes('html') || lowerMsg.includes('css')) {
      conversationContext.currentSubject = 'web';
      return getWebDevelopmentResponse(message);
    }

    if (lowerMsg.includes('math') || lowerMsg.includes('mathematics') ||
      lowerMsg.includes('calculus') || lowerMsg.includes('algebra')) {
      conversationContext.currentSubject = 'math';
      return getMathResponse(message);
    }

    if (lowerMsg.includes('data structure') || lowerMsg.includes('algorithm') ||
      lowerMsg.includes('dsa')) {
      conversationContext.currentSubject = 'dsa';
      return getDSAResponse(message);
    }

    // Website navigation help
    if (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('navigate')) {
      return getNavigationHelp(message);
    }

    if (lowerMsg.includes('dark mode') || lowerMsg.includes('theme')) {
      return getDarkModeHelp();
    }

    if (lowerMsg.includes('revision') || lowerMsg.includes('study')) {
      return getRevisionHelp(message);
    }

    // Exam preparation responses
    if (lowerMsg.includes('exam') || lowerMsg.includes('test') || lowerMsg.includes('preparation')) {
      return getExamPrepResponse(message);
    }

    // Request for examples
    if (lowerMsg.includes('example') || lowerMsg.includes('show me')) {
      conversationContext.askedForExample = true;
      return getExampleResponse(message);
    }

    // Default intelligent response
    return getIntelligentDefault(message);
  }

  function getGreetingResponse() {
    const greetings = [
      "Hi there! 👋 I'm your study buddy here to help with doubts and exam prep. What subject are you working on?",
      "Hello! 😊 Ready to tackle some academic challenges? I'm here to help with concepts, examples, and quick revision!",
      "Hey! 🎓 I'm your doubt-solving assistant. Whether it's last-minute revision or deep concepts, I've got you covered!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  function getConfusionResponse(message) {
    const empathetic = [
      "I understand it can be confusing! 😊 Let's break this down step by step.",
      "No worries, we've all been there! 💪 Let me explain it differently.",
      "That's totally normal! 🤗 Let's approach this from a simpler angle."
    ];

    const response = empathetic[Math.floor(Math.random() * empathetic.length)];

    return [
      response,
      "Can you tell me specifically which part is confusing? I'll give you a clear, simple explanation with examples! 📚"
    ];
  }

  function getJavaScriptResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('function')) {
      return [
        "📝 <strong>JavaScript Functions - Quick Guide:</strong>",
        "• <code>function name() { }</code> - Function declaration<br>• <code>const name = () => { }</code> - Arrow function<br>• <code>function(param) { return param * 2; }</code> - With parameters",
        "💡 <strong>Exam Tip:</strong> Remember function hoisting - declarations are moved to top!<br><br>Want an example or need help with a specific function concept?"
      ];
    }

    if (lowerMsg.includes('promise') || lowerMsg.includes('async')) {
      return [
        "⚡ <strong>Promises & Async - Last-Minute Notes:</strong>",
        "• Promise: <code>.then().catch()</code><br>• Async/Await: <code>async function() { await promise; }</code><br>• Error handling: <code>try-catch</code> blocks",
        "🎯 <strong>Common Exam Q:</strong> 'Explain Promise vs Callback' - Promises avoid callback hell!<br><br>Need a coding example?"
      ];
    }

    return "JavaScript is awesome! 🚀 What specific JS concept do you need help with? (functions, promises, DOM, events, etc.)";
  }

  function getWebDevelopmentResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('flexbox') || lowerMsg.includes('flex')) {
      return [
        "📐 <strong>CSS Flexbox - Quick Reference:</strong>",
        "• Container: <code>display: flex;</code><br>• Center items: <code>justify-content: center; align-items: center;</code><br>• Direction: <code>flex-direction: row/column;</code>",
        "🎯 <strong>Mnemonic:</strong> 'Justify = Horizontal, Align = Vertical' (in row direction)<br><br>Want to see a layout example?"
      ];
    }

    if (lowerMsg.includes('responsive') || lowerMsg.includes('media query')) {
      return [
        "📱 <strong>Responsive Design - Exam Essentials:</strong>",
        "• Mobile-first: <code>@media (min-width: 768px)</code><br>• Breakpoints: 576px (mobile), 768px (tablet), 992px (desktop)<br>• Viewport: <code>&lt;meta name='viewport'&gt;</code>",
        "💡 <strong>Quick Tip:</strong> Start with mobile design, then scale up!<br><br>Need help with specific breakpoints?"
      ];
    }

    return "Web development question! 🌐 Are you asking about HTML structure, CSS styling, or responsive design?";
  }

  function getMathResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('derivative') || lowerMsg.includes('differentiation')) {
      return [
        "📊 <strong>Derivatives - Quick Formula Sheet:</strong>",
        "• Power rule: <code>d/dx(x^n) = nx^(n-1)</code><br>• Product rule: <code>(uv)' = u'v + uv'</code><br>• Chain rule: <code>(f(g(x)))' = f'(g(x)) × g'(x)</code>",
        "🎯 <strong>Memory Trick:</strong> 'Power down, multiply by power'<br><br>Want me to solve a specific derivative problem?"
      ];
    }

    if (lowerMsg.includes('integral') || lowerMsg.includes('integration')) {
      return [
        "∫ <strong>Integration - Essential Formulas:</strong>",
        "• Power rule: <code>∫x^n dx = x^(n+1)/(n+1) + C</code><br>• By parts: <code>∫u dv = uv - ∫v du</code><br>• Substitution: Let u = inner function",
        "💡 <strong>Exam Tip:</strong> Always add constant 'C' for indefinite integrals!<br><br>Need help with a specific integral?"
      ];
    }

    return "Math can be challenging! 📐 Which topic do you need help with? (calculus, algebra, trigonometry, statistics?)";
  }

  function getDSAResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('array') || lowerMsg.includes('sorting')) {
      return [
        "🔢 <strong>Arrays & Sorting - Quick Review:</strong>",
        "• Bubble Sort: O(n²) - Simple but slow<br>• Quick Sort: O(n log n) average - Divide & conquer<br>• Merge Sort: O(n log n) always - Stable sorting",
        "🎯 <strong>Interview Tip:</strong> Know time complexities by heart!<br><br>Want to see a sorting algorithm implementation?"
      ];
    }

    if (lowerMsg.includes('linked list') || lowerMsg.includes('list')) {
      return [
        "🔗 <strong>Linked Lists - Key Points:</strong>",
        "• Singly: Each node → next<br>• Doubly: Each node ← → next<br>• Operations: Insert O(1), Search O(n), Delete O(1) if node known",
        "💡 <strong>Common Bug:</strong> Always check for null pointers!<br><br>Need help with list operations?"
      ];
    }

    return "Data Structures & Algorithms! 💻 Which topic: arrays, linked lists, trees, graphs, or sorting algorithms?";
  }

  function getNavigationHelp(message) {
    return [
      "🧭 <strong>LastMinuteHub Navigation Guide:</strong>",
      "• <strong>Search:</strong> Use the search bar at top - try subject names or codes<br>• <strong>Browse:</strong> Click branch → year → subject<br>• <strong>Revision Mode:</strong> Click 'Revision Mode' for quick study guides",
      "💡 <strong>Pro Tip:</strong> Use keywords like 'ISE', '3rd year', or subject codes for better results!<br><br>What are you looking for specifically?"
    ];
  }

  function getDarkModeHelp() {
    return [
      "🌙 <strong>Dark Mode Help:</strong>",
      "Click the moon icon (🌙) in the header to toggle dark mode. It saves your preference automatically!",
      "💡 <strong>Tip:</strong> Dark mode is easier on the eyes during late-night study sessions! 😴"
    ];
  }

  function getRevisionHelp(message) {
    return [
      "📚 <strong>Revision Mode Features:</strong>",
      "• <strong>Quick Summaries:</strong> One-page concept overviews<br>• <strong>Formula Sheets:</strong> Key equations and syntax<br>• <strong>Practice Questions:</strong> Exam-style problems<br>• <strong>Timed Reading:</strong> Efficient study schedules",
      "🎯 <strong>Study Tip:</strong> Use the 15-minute revision cards for last-minute prep!<br><br>Which subject do you want to revise?"
    ];
  }

  function getExamPrepResponse(message) {
    return [
      "🎓 <strong>Exam Preparation Strategy:</strong>",
      "• <strong>Last 24 hours:</strong> Review formula sheets & key concepts<br>• <strong>Last week:</strong> Practice previous year questions<br>• <strong>Last month:</strong> Complete syllabus coverage",
      "💪 <strong>Quick Tips:</strong><br>- Sleep well before exam<br>- Review, don't learn new topics<br>- Practice time management<br><br>What subject is your exam on?"
    ];
  }

  function getExampleResponse(message) {
    return [
      "📝 <strong>I'd love to show you an example!</strong>",
      "Could you be more specific about what you need an example of? For instance:",
      "• Code example (which language/concept?)<br>• Math problem solution<br>• Concept explanation<br>• Real-world application<br><br>The more specific you are, the better I can help! 😊"
    ];
  }

  function getIntelligentDefault(message) {
    // Analyze message for keywords and provide intelligent response
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.length < 3) {
      return "Could you please elaborate a bit more? I want to give you the best help possible! 😊";
    }

    if (lowerMsg.includes('?')) {
      return [
        "Great question! 🤔 I want to make sure I give you the most helpful answer.",
        "Could you tell me:<br>• Which subject/topic is this about?<br>• Are you preparing for an exam?<br>• Do you need theory, examples, or practice problems?<br><br>This helps me tailor my response perfectly for you! 📚"
      ];
    }

    return [
      "I'm here to help with your studies! 📖 I can assist with:",
      "• <strong>Academic doubts:</strong> Math, Programming, Engineering subjects<br>• <strong>Exam preparation:</strong> Quick revision, formulas, tips<br>• <strong>Website help:</strong> Finding materials, using features<br>• <strong>Study guidance:</strong> Learning strategies, time management",
      "What would you like to explore? Just ask me anything! 😊"
    ];
  }

  // Enhanced initial greeting with more personality
  setTimeout(() => {
    addMessage('bot', "👋 Hey there! I'm your study companion at LastMinuteHub!");
    setTimeout(() => {
      addMessage('bot', "I'm here to help with academic doubts, exam prep, and navigating the site. What's on your mind today? 📚✨");
    }, 1500);
  }, 2000);
})();

// Load Smart Notification System
(function loadNotificationSystem() {
  // Load notification system scripts
  const scripts = [
    'notification-system.js',
    'notification-ui.js',
    'timetable-parser.js'
  ];

  scripts.forEach(script => {
    const scriptEl = document.createElement('script');
    scriptEl.src = script;
    scriptEl.async = true;
    document.head.appendChild(scriptEl);
  });

  console.log('📚 Smart Notification System loading...');
})();

// Dark Mode toggle functionality - Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return; // Only on pages with the toggle

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    toggleBtn.textContent = '☀️';
  } else {
    toggleBtn.textContent = '🌙';
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
});


