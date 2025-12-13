# SIT Logo Integration

## Instructions for Adding the SIT Logo

1. **Save the Logo Image:**
   - Save the SIT logo image as `assets/sit-logo.png`
   - Recommended size: 200x200 pixels or higher for crisp display
   - Format: PNG with transparent background (preferred) or JPG

2. **Logo Features:**
   - The logo will be displayed in a circular container
   - Hover effects with subtle scaling and shadow
   - Responsive sizing for different screen sizes
   - Dark mode compatibility

3. **Current Implementation:**
   - Logo container: 120px × 120px (desktop)
   - Responsive: 100px × 100px (tablet), 80px × 80px (mobile)
   - White background with blue shadow
   - Smooth hover animations

4. **File Location:**
   ```
   assets/
   └── sit-logo.png  ← Place the actual SIT logo here
   ```

## Alternative Logo Formats

If you have the logo in a different format:
- **SVG**: Best for scalability, update the HTML to use `<svg>` instead of `<img>`
- **JPG**: Works fine, but PNG with transparency is preferred
- **WebP**: Modern format, good for performance

## Testing

After adding the logo:
1. Open `login.html` in your browser
2. Check the logo displays correctly
3. Test hover effects
4. Verify responsive behavior on mobile
5. Test dark mode compatibility