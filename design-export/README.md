# Design Style Export

This folder contains all the files needed to replicate the Code Genie design style in your project.

## Files Included

### Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration for Tailwind
- `package-dependencies.json` - Required npm packages

### Stylesheets

- `index.css` - Base styles with Tailwind directives and font setup
- `App.css` - Additional component styles and animations

### Documentation

- `DESIGN_SYSTEM.md` - Complete design system documentation with colors, typography, spacing, and component patterns
- `README.md` - This file

## Quick Start

### 1. Install Dependencies

```bash
npm install tailwindcss autoprefixer postcss
# or
yarn add tailwindcss autoprefixer postcss
```

### 2. Copy Configuration Files

Copy these files to your project root:

- `tailwind.config.js`
- `postcss.config.js`

### 3. Set Up Styles

Copy `index.css` to your main stylesheet location and import it in your app entry point:

```javascript
import './index.css';
```

### 4. Apply Design System

Use the classes and patterns documented in `DESIGN_SYSTEM.md`:

```jsx
// Example: Main container
<div className="min-h-screen text-white font-mono" style={{backgroundColor: '#09090b'}}>
  <div className="max-w-7xl mx-auto p-8">
    {/* Your content */}
  </div>
</div>

// Example: Button
<button className="py-3 border border-zinc-800 hover:border-zinc-600 
                   transition-colors text-sm font-light tracking-wider">
  Click me
</button>

// Example: Input
<input className="w-full bg-transparent border border-zinc-800 
                  focus:border-zinc-600 outline-none p-3 text-sm" />
```

## Key Design Principles

1. **Dark Theme**: Primary background `#09090b`
2. **Minimal Borders**: Subtle `zinc-800` borders for structure
3. **Light Typography**: `font-light` for elegant feel
4. **Wide Letter Spacing**: `tracking-wide` for headings
5. **Monospace Font**: For code and technical content
6. **Zinc Color Palette**: Consistent use of zinc shades

## Color Reference

- Background: `#09090b` (zinc-950)
- Text Primary: `white` / `zinc-50`
- Text Secondary: `zinc-300`
- Text Muted: `zinc-400`, `zinc-500`, `zinc-600`
- Borders: `zinc-800` (default), `zinc-600` (hover/focus)

## Typography Reference

- Headings: `text-4xl font-light tracking-[0.3em]`
- Labels: `text-zinc-400 text-sm font-light tracking-wider`
- Body: `text-sm text-zinc-300`
- Code: `font-mono` or `font-family: monospace`

## Component Patterns

See `DESIGN_SYSTEM.md` for complete component patterns including:

- Buttons
- Input fields
- Textareas
- Tabs
- Cards/Modals
- Layout grids

## Notes

- This design uses Tailwind CSS utility classes
- Custom colors are defined inline using hex values
- The design is optimized for dark mode
- All interactive elements have hover and focus states
- Transitions are used for smooth state changes

## Troubleshooting

### CSS Linter Warnings

If you see warnings about "Unknown at rule @tailwind" in `index.css`, these are expected and harmless. The `@tailwind` directives are valid Tailwind CSS syntax that gets processed by PostCSS. The `.vscode/settings.json` file included in this export will suppress these warnings in VS Code.
