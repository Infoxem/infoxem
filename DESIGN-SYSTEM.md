# Infoxem interface foundations

The interface adapts Apollo’s compact navigation, discovery filters, tabular results, and profile structure to pharmaceutical export workflows.

| Role           | Value                         |
| -------------- | ----------------------------- |
| Primary action | Cobalt `#245BE3`              |
| Primary hover  | `#1649CB`                     |
| Main text      | `#202B3B`                     |
| Secondary text | `#718096`                     |
| Canvas         | `#F8FAFC`                     |
| Surface        | `#FFFFFF`                     |
| Borders        | `#E9EDF2`                     |
| Positive state | Muted green                   |
| Typography     | Self-hosted Inter, sans-serif |

Shared patterns include a fixed sidebar, global search, breadcrumb header, primary/secondary buttons, bookmark actions, filter panels, identity cells, product tags, profiles, contact cards, and modal forms.

Styling uses Tailwind CSS throughout. Reuse the static utility recipes in `src/lib/ui.ts` for repeated patterns, and compose additional Tailwind utilities with `ui()`. Do not add page-specific stylesheets. `src/app/globals.css` holds shared theme tokens, base rules, and animation keyframes only.

Use `BrandLogo` for the supplied assets in `public/images`: the wordmark for expanded navigation and the icon for collapsed navigation and branded illustrations. The same icon is used for browser metadata.

On mobile the sidebar becomes a drawer, filters stack above the results, cards reflow, and wide tables scroll within their containers. Keyboard focus, labelled controls, empty results, missing information, selected records, disabled controls, and reduced-motion preferences have defined states.
