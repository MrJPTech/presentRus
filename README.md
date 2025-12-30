<p align="center">
  <img src="https://img.shields.io/badge/PRSMTECH-Presentation%20Logic-0057e6?style=for-the-badge&labelColor=5c00e6" alt="PRSMTECH Presentation Logic" />
</p>

<h1 align="center">
  <br />
  presentRus
  <br />
</h1>

<p align="center">
  <strong>Unified Presentation Framework for Multi-Platform Slide Generation</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/-Features-0057e6?style=flat-square" alt="Features" /></a>
  <a href="#installation"><img src="https://img.shields.io/badge/-Installation-0057e6?style=flat-square" alt="Installation" /></a>
  <a href="#usage"><img src="https://img.shields.io/badge/-Usage-0057e6?style=flat-square" alt="Usage" /></a>
  <a href="#frameworks"><img src="https://img.shields.io/badge/-Frameworks-0057e6?style=flat-square" alt="Frameworks" /></a>
  <a href="#api"><img src="https://img.shields.io/badge/-API-0057e6?style=flat-square" alt="API" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-28a745?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/ES%20Modules-enabled-f7df1e?style=flat-square" alt="ESM" />
</p>

---

## Overview

**presentRus** is a unified presentation framework that provides:

- **Framework-Agnostic Design Tokens** - Single source of truth for colors, typography, and spacing
- **Multi-Framework CSS Generation** - Compile once, deploy to Slidev, Reveal.js, or WebSlides
- **Intelligent Framework Selection** - Automatically choose the best framework based on content
- **Content Parsing** - Extract metadata and characteristics from Markdown/HTML presentations

Built on the [PRSMTECH Design System](https://prsmtech.com), this toolkit ensures consistent branding across all presentation formats.

---

## Features

| Feature | Description |
|---------|-------------|
| **Design Tokens** | JSON-based tokens derived from PRSMTECH brand guidelines |
| **Multi-Framework CSS** | Pre-compiled CSS for Slidev, Reveal.js, and WebSlides |
| **Tailwind Integration** | Ready-to-use Tailwind CSS configuration |
| **Content Analysis** | Detect live code, Mermaid diagrams, LaTeX, and Vue components |
| **Framework Routing** | Smart selection based on content requirements |
| **Dark Mode** | Full dark theme support with semantic color mapping |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/swizzimatic/presentRus.git
cd presentRus

# Install dependencies
npm install

# Build theme CSS
npm run theme:build
```

---

## Usage

### Quick Start

```javascript
import {
  selectFramework,
  parseContent,
  getThemeCSS,
  FRAMEWORKS
} from '@prsmtech/presentation-logic';

// Parse a presentation file
const content = parseContent('./slides.md');
console.log(`Slides: ${content.slideCount}`);
console.log(`Recommended: ${content.recommendedFramework}`);

// Get CSS for a specific framework
const css = getThemeCSS(FRAMEWORKS.SLIDEV);
```

### Framework Selection

```javascript
import { selectFramework, CONTENT_TYPES } from '@prsmtech/presentation-logic';

// Automatic framework selection based on content
const framework = selectFramework({
  contentType: CONTENT_TYPES.TECHNICAL,
  hasLiveCode: true,      // → Slidev (Monaco editor)
  hasMermaid: false,
  hasLatex: false,
  exportFormat: 'pdf'
});
```

### Theme Building

```bash
# Build all framework CSS
npm run theme:build

# Watch for changes
npm run theme:watch
```

---

## Frameworks

### Supported Frameworks

| Framework | Live Code | Mermaid | LaTeX | PDF Export | Best For |
|-----------|-----------|---------|-------|------------|----------|
| **Slidev** | Yes | Yes | Yes | Yes | Technical talks, code demos |
| **Reveal.js** | No | No | Yes | Yes | Corporate, PDF distribution |
| **WebSlides** | No | No | No | No | Marketing, landing pages |

### Framework Selection Logic

```
Live Code Demo?          → Slidev
Vue Components Needed?   → Slidev
Mermaid Diagrams?        → Slidev
PDF Export Priority?     → Reveal.js
Marketing Content?       → WebSlides
Corporate Presentation?  → Reveal.js
Default                  → Slidev
```

---

## API

### Core Functions

#### `selectFramework(options)`

Select the optimal presentation framework based on content characteristics.

```typescript
interface FrameworkOptions {
  contentType?: 'technical' | 'marketing' | 'portfolio' | 'training' | 'corporate';
  hasLiveCode?: boolean;
  hasMermaid?: boolean;
  hasLatex?: boolean;
  exportFormat?: 'pdf' | 'html' | null;
  needsVueComponents?: boolean;
  responsive?: boolean;
}

selectFramework(options: FrameworkOptions): 'slidev' | 'reveal' | 'webslides'
```

#### `parseContent(filePath)`

Parse a presentation file and extract metadata.

```typescript
interface ParsedContent {
  name: string;
  type: 'markdown' | 'html' | 'unknown';
  frontmatter?: Record<string, any>;
  slides: string[];
  slideCount: number;
  characteristics: {
    hasLiveCode: boolean;
    hasMermaid: boolean;
    hasLatex: boolean;
    hasVueComponents: boolean;
    estimatedDuration: number;
  };
  recommendedFramework: string;
}
```

#### `getDesignTokens()`

Load design tokens from `variables.json`.

#### `getThemeCSS(framework)`

Get compiled CSS for a specific framework.

#### `getCSSVariables()`

Get all CSS custom properties as key-value pairs.

#### `createPresentationConfig(options)`

Generate a complete presentation configuration object.

---

## Design Tokens

### Color Palette

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Primary | `#0057e6` | `#4d94ff` |
| Secondary | `#5c00e6` | `#944dff` |
| Background | `#ffffff` | `#212529` |
| Text | `#212529` | `#f8f9fa` |
| Heading | `#0057e6` | `#4d94ff` |

### Typography

| Font Role | Stack |
|-----------|-------|
| Sans | Inter, Geist, system-ui |
| Heading | Space Grotesk, Geist |
| Mono | Maple Mono, Geist Mono, Fira Code |

---

## Project Structure

```
presentRus/
├── core/
│   └── index.js              # Core module (framework router, parser)
├── themes/prsmtech/
│   ├── variables.json        # Design tokens (source of truth)
│   ├── build.js              # Theme compiler
│   └── dist/                 # Generated CSS
│       ├── base.css          # Shared CSS variables
│       ├── slidev.css        # Slidev-specific styles
│       ├── reveal.css        # Reveal.js styles
│       ├── webslides.css     # WebSlides styles
│       └── tailwind.config.js
├── .memory-bank/             # Context management
├── package.json
└── README.md
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run theme:build` | Build all framework CSS from tokens |
| `npm run theme:watch` | Watch and rebuild on changes |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with precision by <a href="https://prsmtech.com">PRSMTECH</a></sub>
</p>
