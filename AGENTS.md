# Taskway

- React 19, JavaScript, Vite, Tailwind CSS 4; Capacitor wrappers in `android/` and `ios/`.
- Install locked dependencies: `npm ci`.
- Development server: `npm run dev -- --host 127.0.0.1`.
- Verify: `npm run lint`, `node --test scripts/*.test.mjs`, and `npm run build`.
- Theme palettes and derived UI contrast tokens: `src/config/themes.js`; applied by `src/contexts/ThemeContext.jsx`.
- Downloadable themes: `public/packs/catalogo.json` and one JSON per pack. Validate imported packs with `src/lib/packSchema.js`; never bypass validation when rendering backgrounds or SVG paths.
- Browser verification should use an isolated profile: tasks, events, classes, themes and installed packs are persisted in localStorage.
