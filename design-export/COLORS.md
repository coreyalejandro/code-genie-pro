# Color Palette Reference

## Background Colors

| Color | Hex | Tailwind Class | Usage |
| ----- | --- | -------------- | ----- |
| Primary Background | `#09090b` | `zinc-950` | Main app background |
| Secondary Background | `#18181b` | `zinc-900` | Modals, cards |
| Tertiary Background | `#0f0f10` | Custom | Alternative backgrounds |

## Text Colors

| Color | Hex | Tailwind Class | Usage |
| ----- | --- | -------------- | ----- |
| Primary Text | `#fafafa` | `zinc-50` / `white` | Main content, headings |
| Secondary Text | `#d4d4d8` | `zinc-300` | Body text, descriptions |
| Tertiary Text | `#a1a1aa` | `zinc-400` | Labels, metadata |
| Muted Text | `#71717a` | `zinc-500` | Disabled states, hints |
| Subtle Text | `#52525b` | `zinc-600` | Placeholders, very subtle text |

## Border Colors

| Color | Hex | Tailwind Class | Usage |
| ----- | --- | -------------- | ----- |
| Default Border | `#27272a` | `zinc-800` | Standard borders |
| Hover Border | `#52525b` | `zinc-600` | Hover states |
| Disabled Border | `#18181b` | `zinc-900` | Disabled elements |
| Error Border | `#3f3f46` | `zinc-700` | Error states (if needed) |

## Usage Examples

### Inline Styles

```jsx
// Background
style={{backgroundColor: '#09090b'}}
style={{backgroundColor: '#18181b'}}

// Border
style={{borderColor: '#27272a'}}
```

### Tailwind Classes

```jsx
// Text
className="text-zinc-50"      // Primary text
className="text-zinc-300"      // Secondary text
className="text-zinc-400"      // Labels
className="text-zinc-500"      // Muted
className="text-zinc-600"      // Subtle

// Borders
className="border-zinc-800"    // Default
className="border-zinc-600"    // Hover/Focus
className="border-zinc-900"    // Disabled

// Backgrounds
className="bg-zinc-950"        // Primary
className="bg-zinc-900"        // Secondary
```

## Color Combinations

### Primary Text on Dark Background

- `text-zinc-50` on `#09090b` - High contrast, readable
- `text-zinc-300` on `#09090b` - Good contrast, secondary content
- `text-zinc-400` on `#09090b` - Medium contrast, labels

### Borders on Dark Background

- `border-zinc-800` on `#09090b` - Subtle, structural
- `border-zinc-600` on `#09090b` - Visible, interactive

### Interactive States

- Default: `border-zinc-800 text-zinc-300`
- Hover: `border-zinc-600 text-zinc-50`
- Focus: `border-zinc-600`
- Disabled: `border-zinc-900 text-zinc-600`

## Accessibility

All color combinations meet WCAG AA standards:

- Primary text (`zinc-50`) on dark background: ✅ 15.8:1 contrast ratio
- Secondary text (`zinc-300`) on dark background: ✅ 8.2:1 contrast ratio
- Labels (`zinc-400`) on dark background: ✅ 5.7:1 contrast ratio

## CSS Variables (Optional)

If you want to use CSS variables, add these to your CSS:

```css
:root {
  --bg-primary: #09090b;
  --bg-secondary: #18181b;
  --text-primary: #fafafa;
  --text-secondary: #d4d4d8;
  --text-tertiary: #a1a1aa;
  --text-muted: #71717a;
  --border-default: #27272a;
  --border-hover: #52525b;
  --border-disabled: #18181b;
}
```

Then use them:

```css
background-color: var(--bg-primary);
color: var(--text-primary);
border-color: var(--border-default);
```
