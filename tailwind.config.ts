import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

/**
 * `red` (brand accent) and `navy` (primary text) resolve through CSS variables.
 * Public pages keep the BGSB red/navy; the dashboard ([data-admin-shell]) swaps
 * them for the Atlassian-style blue/ink palette defined in globals.css.
 */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "rgb(var(--c-navy) / <alpha-value>)",
        red: { ...colors.red, DEFAULT: "rgb(var(--c-accent) / <alpha-value>)" },
        cream: "#F7F8FA",
        ds: {
          text: "#172B4D",
          subtle: "#44546F",
          subtlest: "#626F86",
          border: "#DCDFE4",
          input: "#8590A2",
          sunken: "#F7F8F9",
          neutral: "#F1F2F4",
          hovered: "#E9EBEE",
          selected: "#E9F2FF",
          brand: "#0C66E4",
          "brand-hover": "#0055CC",
          "brand-pressed": "#09326C",
          success: "#22A06B",
          warning: "#E2B203",
          danger: "#C9372C",
          discovery: "#8270DB",
          info: "#1D7AFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-ui)", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Ubuntu", '"Helvetica Neue"', "sans-serif"],
      },
      borderRadius: { ds: "3px" },
      boxShadow: {
        soft: "0 16px 40px rgba(10,38,71,.09)",
        raised: "0 1px 1px rgba(9,30,66,.25), 0 0 1px rgba(9,30,66,.31)",
        overlay: "0 8px 12px rgba(9,30,66,.15), 0 0 1px rgba(9,30,66,.31)",
      },
    },
  },
  plugins: [],
} satisfies Config;
