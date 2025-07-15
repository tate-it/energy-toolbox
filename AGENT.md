# AGENT.md

## Commands
- **Build**: `pnpm build`
- **Lint**: `pnpm lint` / `pnpm format` / `pnpm format:fix`
- **Test**: `pnpm test` (vitest), `pnpm test:run` (single run), `pnpm test:coverage`
- **E2E**: `pnpm test:e2e` (playwright), `pnpm test:e2e:ui`
- **Dev**: `pnpm dev --turbopack`

## Architecture
- **Next.js 15** app router project with TypeScript
- **Structure**: `/app` (routes), `/components` (React components), `/lib` (utilities), `/hooks`, `/providers`
- **Main feature**: XML Generator for SII (`/xml-generator/*`)
- **UI**: Radix UI components with Tailwind CSS
- **Testing**: Vitest + Testing Library + Playwright

## Code Style
- **Formatting**: Ultracite (extends Biome) with single quotes, trailing commas, semicolons as needed
- **Linting**: ESLint with Next.js core-web-vitals + TypeScript
- **Italian-first**: All user-facing text in Italian (especially XML generator)
- **Forms**: Use `FormField` with `control={form.control}`, not `register`
- **Types**: Import from `@/*` paths, use strict TypeScript with null checks
- **Constants**: Import labels from `constants.ts`, never hardcode option text

## Rules
- Follow accessibility guidelines (extensive ultracite rules)
- Use semantic HTML and proper ARIA attributes
- Prefer `for...of` over `forEach`, arrow functions over function expressions
- Use `const` for non-reassigned variables, template literals over concatenation
- No `console.log`, `debugger`, or hardcoded sensitive data
