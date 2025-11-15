# ADR 0002: Frontend Stack - Next.js, TypeScript, Tailwind, shadcn/ui

**Date**: 2025-01-15

**Status**: Accepted

## Context

The frontend needs to provide an elegant, accessible UI for three main workflows:
1. Image upload and molecular structure recognition
2. IUPAC name to SMILES conversion
3. SMILES to IUPAC name conversion

Requirements:
- Responsive design for desktop and mobile
- Accessibility (WCAG 2.1 AA)
- Fast loading and interactions
- Copy-to-clipboard and download functionality
- Clear error states and loading indicators

## Decision

**Framework**: Next.js 14 (App Router)
- React-based with excellent developer experience
- File-based routing
- Built-in optimization (images, fonts, code splitting)
- Can add SSR/SSG later if needed for marketing pages

**Language**: TypeScript
- Type safety across the codebase
- Better IDE support and autocomplete
- Catch errors at compile time
- Self-documenting code with interfaces

**Styling**: Tailwind CSS
- Utility-first approach for rapid development
- Excellent responsiveness utilities
- Small bundle size (unused classes purged)
- Consistent design system via configuration

**Component Library**: shadcn/ui
- Copy-paste components (not a dependency)
- Built on Radix UI primitives (accessibility)
- Fully customizable with Tailwind
- Modern, clean aesthetic
- Type-safe with TypeScript

**Forms**: React Hook Form + Zod
- Excellent performance (uncontrolled inputs)
- Type-safe validation with Zod schemas
- Small bundle size
- Great DX with TypeScript

## Alternatives Considered

**Vue/Nuxt**: Excellent framework but smaller ecosystem for UI components

**Svelte/SvelteKit**: Compelling performance but less mature tooling

**Material UI / Ant Design**: Too opinionated, harder to customize

**CSS-in-JS (Emotion, Styled Components)**: More bundle size, Tailwind is faster

**Plain CSS/SCSS**: Harder to maintain consistency, slower development

## Consequences

**Positive**:
- Rapid development with Tailwind utilities
- Accessibility baked in via Radix primitives
- Full control over component code (shadcn/ui)
- Excellent TypeScript support throughout
- Fast build times and bundle sizes

**Negative**:
- Learning curve for Tailwind (if unfamiliar)
- Need to add `tailwindcss-animate` dependency
- Larger initial setup (copying shadcn components)

**Mitigations**:
- Comprehensive component library setup in Phase 1
- Clear component documentation
- ESLint rules for Tailwind class ordering
