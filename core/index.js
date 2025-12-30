/**
 * PRSMTECH Presentation Logic - Core Module
 *
 * Central entry point for presentation logic utilities.
 * Provides framework routing, content parsing, and theme management.
 *
 * @module @prsmtech/presentation-logic
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join, resolve, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load design tokens
const variablesPath = join(__dirname, '../themes/prsmtech/variables.json');
let designTokens = null;

/**
 * Supported presentation frameworks
 */
export const FRAMEWORKS = {
  SLIDEV: 'slidev',
  REVEAL: 'reveal',
  WEBSLIDES: 'webslides'
};

/**
 * Framework capabilities matrix
 */
export const FRAMEWORK_CAPABILITIES = {
  [FRAMEWORKS.SLIDEV]: {
    name: 'Slidev',
    fileExtensions: ['.md'],
    liveCode: true,
    vueComponents: true,
    animations: true,
    pdfExport: true,
    mermaidDiagrams: true,
    latexMath: true,
    codeHighlight: 'shiki',
    dimensions: { width: 980, height: 552 }
  },
  [FRAMEWORKS.REVEAL]: {
    name: 'Reveal.js',
    fileExtensions: ['.html', '.md'],
    liveCode: false,
    vueComponents: false,
    animations: true,
    pdfExport: true,
    mermaidDiagrams: false,
    latexMath: true,
    codeHighlight: 'highlight.js',
    dimensions: { width: 960, height: 700 }
  },
  [FRAMEWORKS.WEBSLIDES]: {
    name: 'WebSlides',
    fileExtensions: ['.html'],
    liveCode: false,
    vueComponents: false,
    animations: true,
    pdfExport: false,
    mermaidDiagrams: false,
    latexMath: false,
    codeHighlight: 'prism',
    dimensions: { width: '100vw', height: '100vh' }
  }
};

/**
 * Content type definitions for routing decisions
 */
export const CONTENT_TYPES = {
  TECHNICAL: 'technical',
  MARKETING: 'marketing',
  PORTFOLIO: 'portfolio',
  TRAINING: 'training',
  CORPORATE: 'corporate'
};

/**
 * Load and cache design tokens
 * @returns {Object} Design tokens from variables.json
 */
export function getDesignTokens() {
  if (!designTokens && existsSync(variablesPath)) {
    designTokens = JSON.parse(readFileSync(variablesPath, 'utf-8'));
  }
  return designTokens;
}

/**
 * Framework Router - Select optimal framework based on content characteristics
 *
 * Decision logic:
 * - Live code demonstrations → Slidev (Monaco editor support)
 * - Marketing/landing → WebSlides (CSS-first, responsive)
 * - PDF export priority → Reveal.js (best PDF support)
 * - Vue components needed → Slidev
 * - Technical documentation → Slidev (Mermaid, LaTeX)
 * - Default → Slidev
 *
 * @param {Object} options - Content characteristics
 * @param {string} options.contentType - Type of content
 * @param {boolean} options.hasLiveCode - Contains live code demos
 * @param {boolean} options.hasMermaid - Contains Mermaid diagrams
 * @param {boolean} options.hasLatex - Contains LaTeX math
 * @param {string} options.exportFormat - Desired export format
 * @param {boolean} options.needsVueComponents - Requires Vue components
 * @param {boolean} options.responsive - Needs responsive design
 * @returns {string} Recommended framework identifier
 */
export function selectFramework(options = {}) {
  const {
    contentType = CONTENT_TYPES.TECHNICAL,
    hasLiveCode = false,
    hasMermaid = false,
    hasLatex = false,
    exportFormat = null,
    needsVueComponents = false,
    responsive = false
  } = options;

  // Live code demos → Slidev (Monaco editor)
  if (hasLiveCode) {
    return FRAMEWORKS.SLIDEV;
  }

  // Vue components required → Slidev
  if (needsVueComponents) {
    return FRAMEWORKS.SLIDEV;
  }

  // Mermaid diagrams → Slidev
  if (hasMermaid) {
    return FRAMEWORKS.SLIDEV;
  }

  // Marketing content → WebSlides (CSS-first, beautiful)
  if (contentType === CONTENT_TYPES.MARKETING && responsive) {
    return FRAMEWORKS.WEBSLIDES;
  }

  // PDF export priority → Reveal.js (best PDF support)
  if (exportFormat === 'pdf') {
    return FRAMEWORKS.REVEAL;
  }

  // Technical with LaTeX → Slidev or Reveal
  if (hasLatex) {
    return FRAMEWORKS.SLIDEV;
  }

  // Corporate presentations → Reveal.js (professional)
  if (contentType === CONTENT_TYPES.CORPORATE) {
    return FRAMEWORKS.REVEAL;
  }

  // Default: Slidev (most versatile)
  return FRAMEWORKS.SLIDEV;
}

/**
 * Parse presentation content file
 *
 * @param {string} filePath - Path to presentation file
 * @returns {Object} Parsed content with metadata and slides
 */
export function parseContent(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const ext = extname(filePath).toLowerCase();
  const name = basename(filePath, ext);

  // Parse frontmatter for Markdown files
  if (ext === '.md') {
    const { data: frontmatter, content: body } = matter(content);

    // Split into slides (Slidev uses ---, Reveal uses <section>)
    const slidesSeparator = /^---$/gm;
    const slides = body.split(slidesSeparator).filter(s => s.trim());

    // Detect content characteristics
    const hasLiveCode = /{monaco}/i.test(body) || /```[\w]+\s*\{.*monaco.*\}/i.test(body);
    const hasMermaid = /```mermaid/i.test(body);
    const hasLatex = /\$\$[\s\S]*?\$\$/g.test(body) || /\\\[[\s\S]*?\\\]/g.test(body);
    const hasVueComponents = /<[A-Z][a-zA-Z]*.*\/?>/.test(body);

    return {
      name,
      type: 'markdown',
      frontmatter,
      slides,
      slideCount: slides.length,
      raw: body,
      characteristics: {
        hasLiveCode,
        hasMermaid,
        hasLatex,
        hasVueComponents,
        estimatedDuration: Math.ceil(slides.length * 2) // ~2 min per slide
      },
      recommendedFramework: selectFramework({
        hasLiveCode,
        hasMermaid,
        hasLatex,
        needsVueComponents: hasVueComponents
      })
    };
  }

  // HTML content
  if (ext === '.html') {
    const slideMatches = content.match(/<section[^>]*>[\s\S]*?<\/section>/gi) || [];
    const isWebSlides = /<div[^>]*id=["']webslides["'][^>]*>/i.test(content);

    return {
      name,
      type: 'html',
      slides: slideMatches.length,
      slideCount: slideMatches.length,
      raw: content,
      characteristics: {
        isWebSlides,
        isReveal: !isWebSlides && slideMatches.length > 0
      },
      recommendedFramework: isWebSlides ? FRAMEWORKS.WEBSLIDES : FRAMEWORKS.REVEAL
    };
  }

  return {
    name,
    type: 'unknown',
    raw: content
  };
}

/**
 * Get theme CSS path for a specific framework
 *
 * @param {string} framework - Framework identifier
 * @returns {string} Path to compiled CSS
 */
export function getThemePath(framework = FRAMEWORKS.SLIDEV) {
  const frameworkKey = framework.toLowerCase();
  const cssPath = join(__dirname, `../themes/prsmtech/dist/${frameworkKey}.css`);

  if (!existsSync(cssPath)) {
    console.warn(`Theme CSS not found: ${cssPath}. Run 'npm run theme:build' first.`);
    return null;
  }

  return cssPath;
}

/**
 * Get CSS content for a specific framework
 *
 * @param {string} framework - Framework identifier
 * @returns {string|null} CSS content or null if not found
 */
export function getThemeCSS(framework = FRAMEWORKS.SLIDEV) {
  const themePath = getThemePath(framework);
  if (!themePath) return null;

  return readFileSync(themePath, 'utf-8');
}

/**
 * Get all available CSS variables from the theme
 *
 * @returns {Object} Key-value pairs of CSS custom properties
 */
export function getCSSVariables() {
  const tokens = getDesignTokens();
  if (!tokens) return {};

  const variables = {};

  function flatten(obj, prefix = 'prsm') {
    Object.entries(obj).forEach(([key, value]) => {
      if (key.startsWith('$')) return; // Skip metadata

      const varName = `--${prefix}-${key}`;

      if (typeof value === 'object' && value !== null) {
        if ('DEFAULT' in value) {
          variables[varName] = value.DEFAULT;
        }
        if ('value' in value) {
          variables[varName] = value.value;
        }
        flatten(value, `${prefix}-${key}`);
      } else if (typeof value === 'string' || typeof value === 'number') {
        variables[varName] = value;
      }
    });
  }

  flatten(tokens);
  return variables;
}

/**
 * Generate inline style object from design tokens
 *
 * @param {Object} options - Styling options
 * @returns {Object} React-compatible style object
 */
export function getInlineStyles(options = {}) {
  const tokens = getDesignTokens();
  if (!tokens) return {};

  const { dark = false } = options;

  const colorScheme = dark ? tokens.colors.dark : tokens.colors.slide;

  return {
    fontFamily: tokens.typography.fontFamily.sans.join(', '),
    backgroundColor: colorScheme.background,
    color: colorScheme.text,
    '--heading-color': colorScheme.heading,
    '--link-color': colorScheme.link
  };
}

/**
 * Create presentation configuration object
 *
 * @param {Object} options - Configuration options
 * @returns {Object} Framework-agnostic presentation config
 */
export function createPresentationConfig(options = {}) {
  const {
    title = 'PRSMTECH Presentation',
    author = 'PRSMTECH',
    theme = 'prsmtech',
    framework = FRAMEWORKS.SLIDEV,
    dark = false,
    exportable = true
  } = options;

  const tokens = getDesignTokens();
  const capabilities = FRAMEWORK_CAPABILITIES[framework];

  return {
    meta: {
      title,
      author,
      generator: '@prsmtech/presentation-logic',
      framework: capabilities.name,
      generatedAt: new Date().toISOString()
    },
    theme: {
      name: theme,
      dark,
      tokens: tokens || {}
    },
    dimensions: capabilities.dimensions,
    features: {
      liveCode: capabilities.liveCode,
      mermaid: capabilities.mermaidDiagrams,
      latex: capabilities.latexMath,
      animations: capabilities.animations,
      pdfExport: capabilities.pdfExport && exportable
    },
    paths: {
      themeCSS: getThemePath(framework),
      baseCSS: getThemePath('base')
    }
  };
}

// Default export
export default {
  FRAMEWORKS,
  FRAMEWORK_CAPABILITIES,
  CONTENT_TYPES,
  selectFramework,
  parseContent,
  getDesignTokens,
  getThemePath,
  getThemeCSS,
  getCSSVariables,
  getInlineStyles,
  createPresentationConfig
};
