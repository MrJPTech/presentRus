/**
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
 * @generated 2025-12-30T01:21:55.091Z
 */

module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "prsm": {
          "primary": {
            "50": "#e6f0ff",
            "100": "#b3d1ff",
            "200": "#80b3ff",
            "300": "#4d94ff",
            "400": "#1a75ff",
            "500": "#0057e6",
            "600": "#0046b3",
            "700": "#003580",
            "800": "#00244d",
            "900": "#00131a",
            "DEFAULT": "#0057e6"
          },
          "secondary": {
            "50": "#f0e6ff",
            "100": "#d1b3ff",
            "200": "#b380ff",
            "300": "#944dff",
            "400": "#751aff",
            "500": "#5c00e6",
            "600": "#4900b3",
            "700": "#370080",
            "800": "#24004d",
            "900": "#12001a",
            "DEFAULT": "#5c00e6"
          },
          "neutral": {
            "50": "#f8f9fa",
            "100": "#f1f3f5",
            "200": "#e9ecef",
            "300": "#dee2e6",
            "400": "#ced4da",
            "500": "#adb5bd",
            "600": "#6c757d",
            "700": "#495057",
            "800": "#343a40",
            "900": "#212529",
            "DEFAULT": "#6c757d"
          },
          "success": {
            "light": "#d4edda",
            "DEFAULT": "#28a745",
            "dark": "#1e7e34"
          },
          "warning": {
            "light": "#fff3cd",
            "DEFAULT": "#ffc107",
            "dark": "#d39e00"
          },
          "error": {
            "light": "#f8d7da",
            "DEFAULT": "#dc3545",
            "dark": "#bd2130"
          },
          "info": {
            "light": "#d1ecf1",
            "DEFAULT": "#17a2b8",
            "dark": "#117a8b"
          }
        }
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "Geist",
          "system-ui",
          "sans-serif"
        ],
        "heading": [
          "Space Grotesk",
          "Geist",
          "system-ui",
          "sans-serif"
        ],
        "mono": [
          "Maple Mono",
          "Geist Mono",
          "Fira Code",
          "ui-monospace",
          "monospace"
        ],
        "display": [
          "Space Grotesk",
          "Inter",
          "sans-serif"
        ]
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem"
      },
      "borderRadius": {
        "none": "0",
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "full": "9999px"
      },
      "boxShadow": {
        "none": "none",
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "DEFAULT": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
      }
    }
  }
};
