# MarketLens Design System

## Product context

- **Product:** A local market-research workspace that turns place data into explainable competitor intelligence.
- **Audience:** Entrepreneurs, researchers, consultants, and analysts making location-sensitive decisions.
- **Interface type:** Hybrid. A brand-led landing page opens into a dense research application.
- **Memorable idea:** MarketLens should feel like a serious intelligence desk that makes complex local evidence immediately legible.

## Visual direction

- **Name:** Cobalt Ledger.
- **Aesthetic:** Modern editorial intelligence with restrained industrial precision.
- **Mood:** Assured, analytical, calm, and premium without looking like enterprise software.
- **Decoration:** Intentional. Fine grid lines and tonal depth may orient the eye; decoration never competes with data.
- **Creative risks:** A near-black navigation shell, oversized editorial numerals, and copper opportunity signals instead of a generic multicolor dashboard.

## Typography

- **Display:** Newsreader Variable. Used for decisive headlines and large report figures.
- **Body and UI:** Manrope Variable. Used for controls, navigation, and explanatory text.
- **Data and code:** JetBrains Mono Variable with tabular numerals.
- **Loading:** `next/font/google`, emitted as self-hosted build assets with `display: swap`.
- **Scale:** 12 / 14 / 16 / 20 / 26 / 36 / 52 / 72 / 96 px.

## Color

- **Approach:** Restrained. Cobalt carries actions and selection; copper is reserved for opportunity or emphasis.
- **Graphite:** `#0B1220` — primary dark shell.
- **Midnight:** `#111B2E` — elevated dark surface.
- **Porcelain:** `#F4F6FA` — application canvas.
- **Paper:** `#FFFFFF` — primary workspace surface.
- **Ink:** `#121826` — primary text.
- **Cobalt:** `#315EF5` — actions, focus, links, and active data.
- **Cobalt dark:** `#2347C8` — hover and pressed states.
- **Cobalt soft:** `#DFE7FF` — selection and chart fills.
- **Copper:** `#B7642A` — opportunity and editorial emphasis.
- **Semantic:** success `#18794E`, warning `#9A5B13`, danger `#B42318`, info `#2357C6`.

## Spacing and layout

- **Base unit:** 4px.
- **Density:** Spacious for marketing, comfortable for forms, compact for data tables.
- **Grid:** 12 columns wide, 6 tablet, 1 mobile.
- **Maximum width:** 1408px.
- **Application structure:** Persistent top navigation, clear page header, primary workspace, then secondary context.
- **Radius:** 6px controls, 12px panels, 18px only for major composed surfaces, full radius only for status pills.
- **Borders:** Fine cool-gray rules. Shadows are reserved for floating or selected surfaces.

## Motion

- **Approach:** Intentional and functional.
- **Durations:** 120ms micro, 180ms controls, 320ms panel reveal, 520ms hero composition.
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for entering; ease-in for exiting.
- **Rules:** Animate opacity and transform. Respect `prefers-reduced-motion`. Never delay a primary action.

## Accessibility

- Body text is at least 16px where content is read continuously.
- Interactive targets are at least 44px.
- Focus rings use cobalt and remain visible on light and dark surfaces.
- Color is never the only status indicator.
- Tables retain keyboard-accessible actions and visible row focus.

## Decisions log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-09-03 | Replaced Editorial Data Desk with Cobalt Ledger | The new direction removes the previous green identity, creates a stronger professional shell, and gives dense research pages a calmer hierarchy. |
