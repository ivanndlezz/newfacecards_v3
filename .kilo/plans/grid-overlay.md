# Plan: Invisible Grid Overlay for Design Guidance

## Objective
Add a non-intrusive CSS grid overlay to help guide element positioning. Visible only when CSS is active (no JS toggle).

## Current Layout Structure
- `.main-content` - Card container (max-width: 500px, width: 97%)
- `.profile-card` - Inner card wrapper
- `.cover-wrap` - Cover/background image area
- `.profile-row` - Flex row containing avatar and text
- `.avt` - Avatar container (100px square)

## Implementation

### 1. CSS Grid Overlay (add to `<style>` in index.html)
Create `.design-grid` overlay that covers `.main-content`:
- Use `display: grid` with 8px columns and 4px baseline
- Position as absolute overlay within main-content
- Semi-transparent magenta/cyan lines for visual guidance
- Always visible when CSS is loaded

### 2. Grid Structure
```css
.main-content.design-grid {
  background-image: 
    /* Column guides (16px safe area, center, content bounds) */
    linear-gradient(to right, 
      rgba(255,0,255,0.15) 1px, transparent 1px,
      transparent 15px, rgba(255,0,255,0.05) 1px, transparent 1px,
      transparent 230px, rgba(255,0,255,0.2) 1px, transparent 1px,
      transparent 249px, rgba(255,0,255,0.05) 1px, transparent 1px,
      transparent 482px, rgba(255,0,255,0.15) 1px, transparent 1px),
    /* Baseline grid */
    linear-gradient(to bottom, rgba(0,255,255,0.1) 1px, transparent 1px);
  background-size: 100% 4px;
  background-position: 0 0;
}
```

### 3. Files to Modify
- `app/index.html` - Add `.design-grid` CSS class

## Notes
- CSS-only implementation
- Overlays the `.main-content` card area
- Uses semi-transparent colors for subtlety