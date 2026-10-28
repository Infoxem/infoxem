# Infoxem

A pharmaceutical export intelligence UI built with Next.js App Router, strict TypeScript, Tailwind CSS 4, Lucide icons, and pnpm. Inter is self-hosted through `next/font/local`; its license is retained in `INTER-LICENSE.txt`.

## Development

Requires Node.js 22.13 or later and pnpm 10 or later.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. All direct dependencies are pinned and the lockfile is committed with the source. No environment variables are required for the UI demo.

```sh
pnpm lint          # Next.js Core Web Vitals, React Hooks, and TypeScript rules
pnpm typecheck     # Generate route types and run strict TypeScript checks
pnpm test          # Filtering, CSV exports, persisted-data validation, and migration
pnpm build        # Production build
pnpm check        # All four checks in sequence
pnpm format       # Format maintained files
pnpm format:check # Check formatting
pnpm start        # Serve the production build
```

## Structure

```text
src/
  app/
    (workspace)/      # Shared layout, Home, Buyers, People, dynamic profiles
    layout.tsx        # Server root layout, metadata, optimized Inter font
    globals.css       # Tailwind theme, shared base rules, and keyframes only
    not-found.tsx
  components/
    layout/           # Persistent navigation and header
    records/          # Reusable company/person identities and record actions
    dialogs/          # Focus-managed shell; separate forms for each workflow
    ui/               # Toast and loading skeleton
  features/
    dashboard/        # Server-rendered overview; small interactive widgets
    directory/        # Search logic, controller hook, search form, results table
    profiles/         # Profile tabs, facts, contact information, and overview
  hooks/              # Dialog focus management and browser-store subscription
  providers/          # Shared workspace actions and state
  lib/                # Demo records, validated persistence, CSV encoding/downloads
  types/              # Record and workspace contracts
tests/                # Meaningful unit tests for data behavior
public/               # Company wordmark/icon, licensed font, and example CSV
legacy/prototype/     # Original HTML, CSS, JavaScript, and journey documents
```

## Architecture conventions

- Route pages and layouts are Server Components by default. They provide metadata, validate profile IDs, and pass typed data to feature components. Missing IDs use `notFound()`.
- The workspace route-group layout persists the sidebar and workspace provider across navigation. Interactive features declare their client boundaries explicitly.
- `useDirectory` handles draft and submitted searches, selection, and pagination. `searchRecords` is a separately tested pure function that returns no data for an empty search.
- Browser persistence uses `useSyncExternalStore`, a stable server snapshot, validated JSON, cross-tab storage subscriptions, and migration from earlier demo storage keys. Restricted storage falls back to an in-memory session.
- Forms live in separate dialog components. The dialog shell handles Escape, focus trapping, focus return, and background scroll locking.
- Tailwind supplies all component and page styling. Shared static utility recipes live in `src/lib/ui.ts` and are composed with `tailwind-merge` to resolve overrides. Use `ui('button primary')` for shared recipes and ordinary utility classes for component-specific styling. Semantic markers support Tailwind descendant/state variants; there are no page-specific CSS files. Keep `globals.css` limited to shared tokens, base rules, and animation keyframes.
- `BrandLogo` uses the supplied wordmark and icon through `next/image`; the icon also serves as the favicon and Apple touch icon. Do not recreate the brand with text or a substitute icon.
- Route loading/error boundaries, keyboard labels, a skip link, responsive navigation, reduced-motion support, empty states, and missing-data states are included.
- Keep future service credentials and database operations in server modules. Replace the demo data access functions when adding a real data provider.

## Routes

| Route                  | Screen                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| `/`                    | Exporter dashboard                                                     |
| `/buyers`              | Search-first buyer directory with a simple search form and table       |
| `/buyers/meridian`     | Example company profile, associated people, and notes                  |
| `/people`              | Search-first people directory using products, companies, and countries |
| `/people/amina-otieno` | Example person profile, employer, contacts, and notes                  |

All demo records have their own profile routes. Directories start with empty tables and show matches after Search or Enter. Clearing the search empties the table. Market links such as `?country=Kenya` and direct searches such as `?q=Generics` open matching results. Global search opens with Ctrl/Cmd+K.

## Current scope

The UI contains 12 illustrative companies and 14 illustrative contacts. All record details are fictional and `.example` emails are placeholders. Bookmarks, lists, profile notes, and data requests are saved locally. Data Enrichment starts at `/enrichment`, opens a dedicated research preview at `/enrichment/research/[id]`, and automatically redirects to `/enrichment/records/ENR-0001`. The preview supports cancellation, restart, and browser-local progress recovery after refresh. Repeated searches reuse one sample record; no database writes, AI provider calls, or live research occur. See [workflow research and design](docs/enrichment-workflow.md) for sources, decisions, and future integration boundaries. Authentication and outreach delivery are not connected. Campaigns are explicitly marked coming soon.

The previous standalone prototype is preserved in `legacy/prototype/`, excluded from type checks, linting, formatting, and public serving. The active app imports none of its code.
