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

  const header = createEl("div", { class: "modal-header" },
    createEl("h2", {}, `${subjectData.name} (${subjectCode})`),
    createEl("p", { class: "muted" }, `${subjectData.branch || ""} • ${subjectData.year || ""}`)
  );
  body.appendChild(header);

  // Prepare materials array in flexible way:
  // Accepts either:
  // - subjectData.materials as array [{type,title,file},...]
  // - subjectData.materials as object {notes:'', questionPapers:'', youtube:''}
  let mats = [];
  const raw = subjectData.materials;
  if (Array.isArray(raw)) {
    mats = raw;
  } else if (raw && typeof raw === "object") {
    // convert object keys to array entries if non-empty
    for (const k of Object.keys(raw)) {
      const v = raw[k];
      if (!v) continue;
      // if v is array, add each
      if (Array.isArray(v)) {
        v.forEach(x => mats.push({ type: k, title: x.split("/").pop ? x.split("/").pop() : x, file: x }));
      } else {
        mats.push({ type: k, title: (typeof v === "string" ? (v.split ? v.split("/").pop() : v) : k), file: v });
      }
    }
  }

  // If no materials, show placeholder message
  if (!mats || mats.length === 0) {
    body.appendChild(createEl("p", { class: "muted" }, "No materials added yet for this subject (demo placeholder)."));
  } else {
    const grid = createEl("div", { class: "resource-grid" });
    mats.forEach(m => {
      const card = createEl("div", { class: "resource-card" });
      const title = m.title || m.type || "Resource";
      card.appendChild(createEl("h4", {}, `${m.type ? (m.type + " - ") : ""}${title}`));
      if (m.file && m.file.startsWith("http")) {
        card.appendChild(createEl("p", {}, createEl("a", { href: m.file, target: "_blank" }, "Open")));
      } else if (m.file) {
        // local file path
        card.appendChild(createEl("p", {}, createEl("a", { href: m.file, download: true }, "Download")));
      } else {
        card.appendChild(createEl("p", { class: "muted" }, "Placeholder (no file)"));
      }
      grid.appendChild(card);
    });
    body.appendChild(grid);
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
});

/* ------------- Minimal CSS for modal and cards (inject if not present) ------------- */
(function injectModalCSS() {
  if (document.getElementById("lmh-modal-style")) return;
  const css = `
  .lmh-modal { position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:9999; }
  .lmh-modal-inner { background:#fff; width:90%; max-width:880px; border-radius:12px; padding:18px; position:relative; max-height:85vh; overflow:auto; }
  .lmh-modal-close { position:absolute; right:12px; top:12px; background:#eee; border:0; border-radius:6px; padding:6px 8px; cursor:pointer; }
  .resource-grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap:12px; margin-top:12px; }
  .resource-card { background:#fff; padding:12px; border-radius:8px; box-shadow:0 6px 18px rgba(12,30,60,0.06); }
  .modal-header h2 { margin:0 0 6px 0; font-size:18px; }
  .modal-header p.muted { margin:0; color:#666; font-size:13px; }
  .btn.small { padding:6px 10px; background:#0d6efd; color:#fff; border-radius:6px; border:0; cursor:pointer; margin-top:10px; }
  .muted { color:#666; }
  `;
  const s = document.createElement("style");
  s.id = "lmh-modal-style";
  s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
})();
