#!/usr/bin/env node

/**
 * PRSMTECH Theme Compiler
 *
 * Compiles variables.json design tokens into framework-specific CSS:
 * - slidev.css   → Slidev CSS custom properties
 * - reveal.css   → Reveal.js theme CSS
 * - webslides.css → WebSlides theme CSS
 * - base.css     → Shared CSS variables (imported by all)
 * - tailwind.config.js → Tailwind CSS configuration
 *
 * Usage:
 *   node themes/prsmtech/build.js [--watch]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, watch } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  variablesPath: join(__dirname, 'variables.json'),
  outputDir: join(__dirname, 'dist'),
  frameworks: ['base', 'slidev', 'reveal', 'webslides', 'tailwind']
};

/**
 * Load and parse variables.json
 */
function loadVariables() {
  const content = readFileSync(CONFIG.variablesPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Flatten nested object with prefix
 */
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}-` : '';
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Skip metadata keys
      if (key.startsWith('$')) return acc;

      // Handle special cases
      if ('value' in value && typeof value.value === 'string') {
        acc[`${pre}${key}`] = value.value;
      } else if ('DEFAULT' in value) {
        acc[`${pre}${key}`] = value.DEFAULT;
        Object.assign(acc, flattenObject(value, `${pre}${key}`));
      } else if (key === 'fontFamily') {
        // Font families need to be quoted and joined
        Object.keys(value).forEach(fontKey => {
          const fonts = value[fontKey];
          acc[`${pre}${key}-${fontKey}`] = Array.isArray(fonts)
            ? fonts.map(f => f.includes(' ') ? `"${f}"` : f).join(', ')
            : fonts;
        });
      } else {
        Object.assign(acc, flattenObject(value, `${pre}${key}`));
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      acc[`${pre}${key}`] = value;
    }

    return acc;
  }, {});
}

/**
 * Generate base CSS with all custom properties
 */
function generateBaseCSS(variables) {
  const flat = flattenObject(variables);

  let css = `/**
 * PRSMTECH Design Tokens - Base CSS Variables
 * Generated from variables.json
 *
 * @generated ${new Date().toISOString()}
 */

:root {
`;

  // Group by category for readability
  const categories = {
    colors: [],
    typography: [],
    spacing: [],
    borders: [],
    shadows: [],
    transitions: [],
    other: []
  };

  Object.entries(flat).forEach(([key, value]) => {
    const cssVar = `  --prsm-${key}: ${value};`;

    if (key.startsWith('colors') || key.startsWith('slide') || key.startsWith('dark')) {
      categories.colors.push(cssVar);
    } else if (key.startsWith('typography') || key.startsWith('font')) {
      categories.typography.push(cssVar);
    } else if (key.startsWith('spacing')) {
      categories.spacing.push(cssVar);
    } else if (key.startsWith('border') || key.startsWith('shadow')) {
      categories.borders.push(cssVar);
    } else if (key.startsWith('transition')) {
      categories.transitions.push(cssVar);
    } else {
      categories.other.push(cssVar);
    }
  });

  // Output with category comments
  css += `  /* Colors */\n${categories.colors.join('\n')}\n\n`;
  css += `  /* Typography */\n${categories.typography.join('\n')}\n\n`;
  css += `  /* Spacing */\n${categories.spacing.join('\n')}\n\n`;
  css += `  /* Borders & Shadows */\n${categories.borders.join('\n')}\n\n`;
  css += `  /* Transitions */\n${categories.transitions.join('\n')}\n\n`;

  if (categories.other.length > 0) {
    css += `  /* Other */\n${categories.other.join('\n')}\n\n`;
  }

  css += `}

/* Dark mode */
[data-theme="dark"],
.dark,
:root.dark {
  --prsm-slide-background: var(--prsm-dark-background);
  --prsm-slide-backgroundAlt: var(--prsm-dark-backgroundAlt);
  --prsm-slide-text: var(--prsm-dark-text);
  --prsm-slide-textMuted: var(--prsm-dark-textMuted);
  --prsm-slide-heading: var(--prsm-dark-heading);
  --prsm-slide-link: var(--prsm-dark-link);
  --prsm-slide-linkHover: var(--prsm-dark-linkHover);
  --prsm-slide-border: var(--prsm-dark-border);
  --prsm-slide-codeBg: var(--prsm-dark-codeBg);
  --prsm-slide-codeText: var(--prsm-dark-codeText);
}
`;

  return css;
}

/**
 * Generate Slidev-specific CSS
 */
function generateSlidevCSS(variables) {
  return `/**
 * PRSMTECH Slidev Theme
 *
 * @generated ${new Date().toISOString()}
 */

@import './base.css';

/* Slidev-specific overrides */
.slidev-layout {
  --slidev-theme-primary: var(--prsm-colors-primary-500);
  --slidev-theme-secondary: var(--prsm-colors-secondary-500);
  --slidev-theme-accent: var(--prsm-colors-primary-600);

  --slidev-slide-width: ${variables.slide?.dimensions?.slidev?.width || 980}px;
  --slidev-slide-height: ${variables.slide?.dimensions?.slidev?.height || 552}px;

  font-family: var(--prsm-typography-fontFamily-sans);
  background: var(--prsm-slide-background);
  color: var(--prsm-slide-text);
  padding: ${variables.slide?.padding?.slidev || '40px'};
}

.slidev-layout h1,
.slidev-layout h2,
.slidev-layout h3 {
  font-family: var(--prsm-typography-fontFamily-heading);
  color: var(--prsm-slide-heading);
  font-weight: var(--prsm-typography-fontWeight-bold);
}

.slidev-layout h1 {
  font-size: var(--prsm-typography-fontSize-5xl);
  line-height: var(--prsm-typography-lineHeight-tight);
  margin-bottom: var(--prsm-spacing-lg);
}

.slidev-layout h2 {
  font-size: var(--prsm-typography-fontSize-3xl);
  margin-bottom: var(--prsm-spacing-md);
}

.slidev-layout h3 {
  font-size: var(--prsm-typography-fontSize-2xl);
  margin-bottom: var(--prsm-spacing-sm);
}

.slidev-layout p {
  font-size: var(--prsm-typography-fontSize-lg);
  line-height: var(--prsm-typography-lineHeight-relaxed);
  color: var(--prsm-slide-text);
}

.slidev-layout a {
  color: var(--prsm-slide-link);
  text-decoration: none;
  transition: color var(--prsm-transitions-duration-fast);
}

.slidev-layout a:hover {
  color: var(--prsm-slide-linkHover);
  text-decoration: underline;
}

.slidev-layout code:not(.shiki) {
  font-family: var(--prsm-typography-fontFamily-mono);
  font-size: var(--prsm-components-code-fontSize);
  background: var(--prsm-slide-codeBg);
  color: var(--prsm-slide-codeText);
  padding: var(--prsm-components-code-padding);
  border-radius: var(--prsm-components-code-borderRadius);
}

.slidev-layout blockquote {
  border-left: ${variables.components?.blockquote?.borderWidth || '4px'} solid var(--prsm-components-blockquote-borderColor);
  background: var(--prsm-colors-primary-50);
  padding: var(--prsm-components-blockquote-padding);
  margin: var(--prsm-spacing-md) 0;
  font-style: italic;
}

.slidev-layout ul,
.slidev-layout ol {
  padding-left: var(--prsm-components-list-indentation);
  margin: var(--prsm-spacing-sm) 0;
}

.slidev-layout li {
  margin-bottom: var(--prsm-spacing-2);
}

.slidev-layout li::marker {
  color: var(--prsm-components-list-bulletColor);
}

/* Cover slide */
.slidev-layout.cover {
  background: var(--prsm-gradients-primary);
  color: var(--prsm-colors-neutral-50);
}

.slidev-layout.cover h1 {
  color: var(--prsm-colors-neutral-50);
}

/* Two-column layout */
.slidev-layout.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--prsm-spacing-xl);
}

/* PRSMTECH brand footer */
.slidev-layout::after {
  content: 'PRSMTECH';
  position: fixed;
  bottom: 20px;
  right: 40px;
  font-family: var(--prsm-typography-fontFamily-heading);
  font-size: var(--prsm-typography-fontSize-sm);
  font-weight: var(--prsm-typography-fontWeight-bold);
  color: var(--prsm-colors-primary-500);
  opacity: 0.6;
}
`;
}

/**
 * Generate Reveal.js-specific CSS
 */
function generateRevealCSS(variables) {
  return `/**
 * PRSMTECH Reveal.js Theme
 *
 * @generated ${new Date().toISOString()}
 */

@import './base.css';

/* Reveal.js theme registration */
section.has-light-background,
section.has-light-background h1,
section.has-light-background h2,
section.has-light-background h3,
section.has-light-background h4,
section.has-light-background h5,
section.has-light-background h6 {
  color: var(--prsm-slide-text);
}

.reveal {
  font-family: var(--prsm-typography-fontFamily-sans);
  font-size: var(--prsm-typography-fontSize-xl);
  font-weight: var(--prsm-typography-fontWeight-normal);
  color: var(--prsm-slide-text);
}

.reveal .slides {
  text-align: left;
}

.reveal .slides section {
  padding: ${variables.slide?.padding?.reveal || '40px 80px'};
}

.reveal h1,
.reveal h2,
.reveal h3,
.reveal h4,
.reveal h5,
.reveal h6 {
  margin: 0 0 var(--prsm-spacing-md) 0;
  font-family: var(--prsm-typography-fontFamily-heading);
  font-weight: var(--prsm-typography-fontWeight-bold);
  line-height: var(--prsm-typography-lineHeight-tight);
  color: var(--prsm-slide-heading);
  text-transform: none;
  word-wrap: break-word;
}

.reveal h1 {
  font-size: var(--prsm-typography-fontSize-5xl);
  text-shadow: none;
}

.reveal h2 {
  font-size: var(--prsm-typography-fontSize-4xl);
}

.reveal h3 {
  font-size: var(--prsm-typography-fontSize-3xl);
}

.reveal h4 {
  font-size: var(--prsm-typography-fontSize-2xl);
}

.reveal p {
  margin: var(--prsm-spacing-md) 0;
  line-height: var(--prsm-typography-lineHeight-relaxed);
}

.reveal a {
  color: var(--prsm-slide-link);
  text-decoration: none;
  transition: color var(--prsm-transitions-duration-fast) var(--prsm-transitions-timing-ease);
}

.reveal a:hover {
  color: var(--prsm-slide-linkHover);
  text-shadow: none;
  border: none;
}

.reveal pre {
  display: block;
  position: relative;
  width: 100%;
  margin: var(--prsm-spacing-md) auto;
  text-align: left;
  font-size: var(--prsm-components-code-fontSize);
  font-family: var(--prsm-typography-fontFamily-mono);
  line-height: var(--prsm-components-code-lineHeight);
  word-wrap: break-word;
  box-shadow: var(--prsm-shadows-md);
  background: var(--prsm-slide-codeBg);
  border-radius: var(--prsm-borderRadius-md);
}

.reveal code {
  font-family: var(--prsm-typography-fontFamily-mono);
  text-transform: none;
  tab-size: 2;
}

.reveal pre code {
  display: block;
  padding: var(--prsm-spacing-md);
  overflow: auto;
  max-height: 400px;
  word-wrap: normal;
}

.reveal blockquote {
  display: block;
  position: relative;
  width: 95%;
  margin: var(--prsm-spacing-md) auto;
  padding: var(--prsm-components-blockquote-padding);
  background: var(--prsm-colors-primary-50);
  border-left: ${variables.components?.blockquote?.borderWidth || '4px'} solid var(--prsm-colors-primary-500);
  font-style: italic;
}

.reveal blockquote p:first-child,
.reveal blockquote p:last-child {
  display: inline-block;
}

.reveal ul,
.reveal ol {
  display: inline-block;
  text-align: left;
  margin: 0 0 0 var(--prsm-components-list-indentation);
}

.reveal ul li,
.reveal ol li {
  margin-bottom: var(--prsm-spacing-2);
}

.reveal ul li::marker,
.reveal ol li::marker {
  color: var(--prsm-components-list-bulletColor);
}

.reveal table {
  margin: auto;
  border-collapse: collapse;
  border-spacing: 0;
}

.reveal table th {
  font-weight: var(--prsm-typography-fontWeight-bold);
  background: var(--prsm-components-table-headerBackground);
}

.reveal table th,
.reveal table td {
  text-align: left;
  padding: var(--prsm-components-table-cellPadding);
  border-bottom: 1px solid var(--prsm-components-table-borderColor);
}

/* Title slide */
.reveal .slides > section.title-slide {
  background: var(--prsm-gradients-primary);
  color: var(--prsm-colors-neutral-50);
}

.reveal .slides > section.title-slide h1,
.reveal .slides > section.title-slide h2 {
  color: var(--prsm-colors-neutral-50);
}

/* Progress bar */
.reveal .progress {
  background: rgba(0, 0, 0, 0.2);
  color: var(--prsm-colors-primary-500);
}

.reveal .progress span {
  background: var(--prsm-colors-primary-500);
  transition: width var(--prsm-transitions-duration-normal) var(--prsm-transitions-timing-ease);
}

/* Controls */
.reveal .controls {
  color: var(--prsm-colors-primary-500);
}

/* Slide number */
.reveal .slide-number {
  font-family: var(--prsm-typography-fontFamily-mono);
  font-size: var(--prsm-typography-fontSize-sm);
  color: var(--prsm-slide-textMuted);
  background-color: transparent;
}
`;
}

/**
 * Generate WebSlides-specific CSS
 */
function generateWebSlidesCSS(variables) {
  return `/**
 * PRSMTECH WebSlides Theme
 *
 * @generated ${new Date().toISOString()}
 */

@import './base.css';

/* WebSlides base overrides */
#webslides {
  font-family: var(--prsm-typography-fontFamily-sans);
  font-size: var(--prsm-typography-fontSize-lg);
  color: var(--prsm-slide-text);
}

#webslides section {
  background: var(--prsm-slide-background);
  padding: ${variables.slide?.padding?.webslides || '80px'};
}

#webslides h1,
#webslides h2,
#webslides h3,
#webslides h4 {
  font-family: var(--prsm-typography-fontFamily-heading);
  font-weight: var(--prsm-typography-fontWeight-bold);
  color: var(--prsm-slide-heading);
  margin-bottom: var(--prsm-spacing-md);
}

#webslides h1 {
  font-size: var(--prsm-typography-fontSize-6xl);
  line-height: var(--prsm-typography-lineHeight-tight);
}

#webslides h2 {
  font-size: var(--prsm-typography-fontSize-4xl);
}

#webslides h3 {
  font-size: var(--prsm-typography-fontSize-3xl);
}

#webslides p {
  line-height: var(--prsm-typography-lineHeight-relaxed);
  margin-bottom: var(--prsm-spacing-md);
}

#webslides a {
  color: var(--prsm-slide-link);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all var(--prsm-transitions-duration-fast);
}

#webslides a:hover {
  color: var(--prsm-slide-linkHover);
  border-bottom-color: var(--prsm-slide-linkHover);
}

#webslides code,
#webslides pre {
  font-family: var(--prsm-typography-fontFamily-mono);
  font-size: var(--prsm-components-code-fontSize);
}

#webslides code {
  background: var(--prsm-slide-codeBg);
  color: var(--prsm-slide-codeText);
  padding: var(--prsm-components-code-padding);
  border-radius: var(--prsm-components-code-borderRadius);
}

#webslides pre {
  background: var(--prsm-slide-codeBg);
  padding: var(--prsm-spacing-md);
  border-radius: var(--prsm-borderRadius-md);
  overflow-x: auto;
  margin: var(--prsm-spacing-md) 0;
}

#webslides pre code {
  background: transparent;
  padding: 0;
}

#webslides blockquote {
  border-left: ${variables.components?.blockquote?.borderWidth || '4px'} solid var(--prsm-colors-primary-500);
  background: var(--prsm-colors-primary-50);
  padding: var(--prsm-components-blockquote-padding);
  margin: var(--prsm-spacing-lg) 0;
  font-style: italic;
}

#webslides ul,
#webslides ol {
  padding-left: var(--prsm-components-list-indentation);
  margin: var(--prsm-spacing-md) 0;
}

#webslides li {
  margin-bottom: var(--prsm-spacing-2);
  line-height: var(--prsm-typography-lineHeight-relaxed);
}

#webslides li::marker {
  color: var(--prsm-components-list-bulletColor);
}

/* WebSlides components */

/* Background variations */
.bg-prsm-primary {
  background-color: var(--prsm-colors-primary-500);
  color: var(--prsm-colors-neutral-50);
}

.bg-prsm-secondary {
  background-color: var(--prsm-colors-secondary-500);
  color: var(--prsm-colors-neutral-50);
}

.bg-prsm-gradient {
  background: var(--prsm-gradients-primary);
  color: var(--prsm-colors-neutral-50);
}

.bg-prsm-dark {
  background: var(--prsm-dark-background);
  color: var(--prsm-dark-text);
}

/* Text colors */
.text-prsm-primary {
  color: var(--prsm-colors-primary-500);
}

.text-prsm-secondary {
  color: var(--prsm-colors-secondary-500);
}

/* Card component */
.prsm-card {
  background: var(--prsm-slide-background);
  border: 1px solid var(--prsm-slide-border);
  border-radius: var(--prsm-borderRadius-lg);
  padding: var(--prsm-spacing-lg);
  box-shadow: var(--prsm-shadows-md);
}

/* Grid layouts */
.prsm-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--prsm-spacing-xl);
}

.prsm-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--prsm-spacing-lg);
}

/* Navigation */
#navigation {
  background: var(--prsm-slide-background);
  border-top: 1px solid var(--prsm-slide-border);
}

#navigation a {
  color: var(--prsm-slide-text);
}

#navigation a:hover {
  color: var(--prsm-colors-primary-500);
}

/* Counter */
#counter {
  font-family: var(--prsm-typography-fontFamily-mono);
  font-size: var(--prsm-typography-fontSize-sm);
  color: var(--prsm-slide-textMuted);
}
`;
}

/**
 * Generate Tailwind CSS configuration
 */
function generateTailwindConfig(variables) {
  const config = {
    theme: {
      extend: {
        colors: {
          prsm: {
            primary: variables.colors.primary,
            secondary: variables.colors.secondary,
            neutral: variables.colors.neutral,
            ...variables.colors.semantic
          }
        },
        fontFamily: {
          sans: variables.typography.fontFamily.sans,
          heading: variables.typography.fontFamily.heading,
          mono: variables.typography.fontFamily.mono,
          display: variables.typography.fontFamily.display
        },
        fontSize: Object.fromEntries(
          Object.entries(variables.typography.fontSize).map(([key, val]) => [
            key,
            typeof val === 'object' ? val.value : val
          ])
        ),
        borderRadius: variables.borderRadius,
        boxShadow: variables.shadows
      }
    }
  };

  return `/**
 * PRSMTECH Tailwind CSS Configuration
 *
 * Import this in your tailwind.config.js:
 *
 * const prsmTheme = require('./themes/prsmtech/dist/tailwind.config.js');
 *
 * module.exports = {
 *   theme: {
 *     extend: {
 *       ...prsmTheme.theme.extend
 *     }
 *   }
 * }
 *
 * @generated ${new Date().toISOString()}
 */

module.exports = ${JSON.stringify(config, null, 2)};
`;
}

/**
 * Build all themes
 */
function build() {
  console.log('🎨 PRSMTECH Theme Compiler');
  console.log('━'.repeat(40));

  // Ensure output directory exists
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Load variables
  console.log('📖 Loading variables.json...');
  const variables = loadVariables();

  // Generate each framework
  const generators = {
    base: generateBaseCSS,
    slidev: generateSlidevCSS,
    reveal: generateRevealCSS,
    webslides: generateWebSlidesCSS,
    tailwind: generateTailwindConfig
  };

  const results = [];

  Object.entries(generators).forEach(([framework, generator]) => {
    const extension = framework === 'tailwind' ? '.config.js' : '.css';
    const outputPath = join(CONFIG.outputDir, `${framework}${extension}`);

    console.log(`⚙️  Generating ${framework}${extension}...`);

    try {
      const content = generator(variables);
      writeFileSync(outputPath, content, 'utf-8');
      results.push({ framework, success: true, path: outputPath });
    } catch (error) {
      results.push({ framework, success: false, error: error.message });
    }
  });

  // Summary
  console.log('━'.repeat(40));
  console.log('📦 Build complete!\n');

  results.forEach(({ framework, success, path, error }) => {
    if (success) {
      console.log(`  ✅ ${framework}: ${path}`);
    } else {
      console.log(`  ❌ ${framework}: ${error}`);
    }
  });

  console.log(`\n📁 Output directory: ${CONFIG.outputDir}`);

  return results.every(r => r.success);
}

/**
 * Watch mode
 */
function watchMode() {
  console.log('👀 Watching for changes...\n');

  build();

  watch(CONFIG.variablesPath, (eventType) => {
    if (eventType === 'change') {
      console.log('\n🔄 variables.json changed, rebuilding...\n');
      build();
    }
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--watch') || args.includes('-w')) {
  watchMode();
} else {
  const success = build();
  process.exit(success ? 0 : 1);
}
