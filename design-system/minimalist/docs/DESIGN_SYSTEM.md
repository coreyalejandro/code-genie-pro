# Design System Documentation

## Overview

This design system implements a minimalist, dark-themed interface with a focus on typography, spacing, and subtle borders.

## Color Palette

### Background Colors

- **Primary Background**: `#09090b` (zinc-950 equivalent)
- **Secondary Background**: `#18181b` (zinc-900 equivalent)
- **Tertiary Background**: `#0f0f10` (dark gray)

### Text Colors

- **Primary Text**: `white` / `zinc-50` - Main content
- **Secondary Text**: `zinc-300` - Supporting content
- **Tertiary Text**: `zinc-400` - Labels and metadata
- **Muted Text**: `zinc-500` - Disabled/inactive states
- **Subtle Text**: `zinc-600` - Hints and placeholders

### Border Colors

- **Default Border**: `zinc-800` (#27272a)
- **Hover Border**: `zinc-600` (#52525b)
- **Disabled Border**: `zinc-900` (#18181b)

## Typography

### Font Family

- **Body**: System font stack (San Francisco, Segoe UI, Roboto, etc.)
- **Code**: Monospace (source-code-pro, Menlo, Monaco, Consolas, Courier New)

### Font Weights

- **Light**: `font-light` (300) - Primary for headings and UI text
- **Normal**: Default (400) - Body text

### Letter Spacing

- **Wide**: `tracking-wide` - Section labels
- **Extra Wide**: `tracking-[0.3em]` - Main headings
- **Default**: Normal tracking for body text

### Font Sizes

- **Heading 1**: `text-4xl` - Main title
- **Heading 2**: `text-2xl` - Modal titles
- **Body**: `text-sm` - Primary body text
- **Small**: `text-xs` - Secondary text, hints

## Spacing

### Container

- **Max Width**: `max-w-7xl` (1280px)
- **Padding**: `p-8` (32px) - Main container padding
- **Gap**: `gap-16` (64px) - Between major sections

### Component Spacing

- **Section Gap**: `space-y-6` to `space-y-8` - Vertical spacing between elements
- **Small Gap**: `space-y-2` to `space-y-3` - Tight spacing for lists
- **Input Padding**: `p-3` to `p-6` - Form element padding

## Borders

### Border Styles

- **Default**: `border border-zinc-800` - Standard borders
- **Hover**: `hover:border-zinc-600` - Interactive element hover state
- **Focus**: `focus:border-zinc-600` - Input focus state
- **Disabled**: `disabled:border-zinc-900` - Disabled state

### Border Widths

- **Standard**: `border` (1px)
- **Thick**: `border-b-2` - Active tab indicator

## Layout Patterns

### Grid Layouts

- **Two Column**: `grid grid-cols-2 gap-16` - Main content areas
- **Six Column**: `grid grid-cols-6 gap-2` - Avatar selection

### Flexbox Patterns

- **Center Content**: `flex justify-center items-center`
- **Space Between**: `flex justify-between items-center`
- **Vertical Stack**: `flex flex-col`

## Component Styles

### Buttons

```css
/* Primary Button */
className="py-3 border border-zinc-800 hover:border-zinc-600 
          disabled:border-zinc-900 disabled:text-zinc-600 
          transition-colors text-sm font-light tracking-wider"
```

### Input Fields

```css
/* Text Input */
className="w-full bg-transparent border border-zinc-800 
          focus:border-zinc-600 outline-none p-3 text-sm"
```

### Textareas

```css
/* Code Editor Style */
className="w-full h-96 bg-transparent border border-zinc-800 
          focus:border-zinc-600 outline-none p-6 text-sm 
          leading-relaxed resize-none"
```

### Tabs

```css
/* Active Tab */
className="text-xl font-light tracking-wide transition-all duration-300
          border-b-2 border-zinc-50 pb-1"

/* Inactive Tab */
className="text-xl font-light tracking-wide transition-all duration-300
          text-zinc-500 hover:text-zinc-300"
```

### Cards/Containers

```css
/* Modal/Dialog */
style={{backgroundColor: '#18181b'}}
className="rounded-xl p-6"

/* Chat Container */
className="border border-zinc-800 h-80 p-4 space-y-4 overflow-y-auto"
```

## Interactive States

### Hover

- Text: `hover:text-zinc-300`
- Borders: `hover:border-zinc-600`
- Transitions: `transition-colors` or `transition-all duration-300`

### Focus

- Inputs: `focus:border-zinc-600 outline-none`

### Disabled

- Borders: `disabled:border-zinc-900`
- Text: `disabled:text-zinc-600`

## Utility Classes

### Common Combinations

- **Section Label**: `text-zinc-400 text-sm font-light tracking-wider`
- **Body Text**: `text-sm text-zinc-300`
- **Muted Text**: `text-zinc-600 text-sm font-light`
- **Primary Heading**: `text-4xl font-light tracking-[0.3em]`

## Responsive Design

### Breakpoints (Tailwind Default)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Accessibility

### Color Contrast

- Ensure text meets WCAG AA standards (4.5:1 for normal text)
- Use `zinc-50` on `#09090b` for primary text
- Use `zinc-300` for secondary text

### Focus States

- Always include visible focus indicators
- Use `focus:border-zinc-600` for inputs

### Reduced Motion

- Respect `prefers-reduced-motion` for animations
- Use `transition-colors` for smooth but subtle changes

## Implementation Notes

1. **Monospace Font**: Applied via `font-mono` class or `font-family: monospace`
2. **Dark Theme**: Background is always dark (`#09090b`)
3. **Minimal Borders**: Use subtle borders (`zinc-800`) for structure
4. **Light Typography**: Use `font-light` for elegant, modern feel
5. **Wide Tracking**: Use letter-spacing for headings and labels
6. **Transparent Backgrounds**: Inputs use `bg-transparent` to blend with dark background
