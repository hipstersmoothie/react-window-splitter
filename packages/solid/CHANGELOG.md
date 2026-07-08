# v1.2.0 (Wed Jul 08 2026)

#### 🚀 Enhancement

- apply animations directly to dom [#85](https://github.com/hipstersmoothie/window-splitter/pull/85) ([@hipstersmoothie](https://github.com/hipstersmoothie) [@vikr01](https://github.com/vikr01))

#### 🐛 Bug Fix

- apply animations directly to dom ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Vik R ([@vikr01](https://github.com/vikr01))

---

# v1.1.1 (Mon Jul 14 2025)

#### 🐛 Bug Fix

- Fix controlled panel resize bugs and make collapse/expand awaitable [#67](https://github.com/hipstersmoothie/window-splitter/pull/67) ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- tests ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- add awaitable expand/collapse to other implementations ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

#### Authors: 1

- Andrew Lisowski ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

---

# v1.1.0 (Mon May 26 2025)

#### 🚀 Enhancement

- Add "shiftAmount" prop [#64](https://github.com/hipstersmoothie/window-splitter/pull/64) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- update tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add "shiftAmount" prop ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.7 (Sun May 11 2025)

#### 🐛 Bug Fix

- Web Component [#59](https://github.com/hipstersmoothie/window-splitter/pull/59) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add readme ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.5 (Sun May 04 2025)

#### 🐛 Bug Fix

- Vue Adapter [#56](https://github.com/hipstersmoothie/window-splitter/pull/56) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- catalogs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- linting ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.4 (Sat May 03 2025)

#### 🐛 Bug Fix

- Svelte Adapter [#55](https://github.com/hipstersmoothie/window-splitter/pull/55) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- builds ([@hipstersmoothie](https://github.com/hipstersmoothie))
- tighten up spacing ([@hipstersmoothie](https://github.com/hipstersmoothie))
- constraints and imperative api ([@hipstersmoothie](https://github.com/hipstersmoothie))
- simplify solid code ([@hipstersmoothie](https://github.com/hipstersmoothie))
- working ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.3 (Tue Apr 29 2025)

#### ⚠️ Pushed to `main`

- fix repo links ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.2 (Tue Apr 29 2025)

#### ⚠️ Pushed to `main`

- fix import (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.8.1 (Mon Apr 28 2025)

#### ⚠️ Pushed to `main`

- add docs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.7.0 (Mon Apr 28 2025)

### Release Notes

#### `@window-splitter/solid` ([#54](https://github.com/hipstersmoothie/window-splitter/pull/54))

The second framework adapter for `window-splitter` is live!

Things of note:

- `react-window-splitter` is deprecated in favor of `@window-splitter/react`
- `@window-splitter/solid` is feature complete and passes the test full test suite
- `@window-splitter/interface` was created to house the shared component types and some help functions

In creating the solid adapter we had to make vanilla JS versions of some functions we previously got from a dependency. This resulted in a 7.4% bundle size reduction for the react package 🎉 

### Breaking Change

The API for registering panel handles changed a little bit. If you're using the `@window-splitter/state` package directly you will have to update your code (if you exist send me a message!)

---

#### 🚀 Enhancement

- `@window-splitter/solid` [#54](https://github.com/hipstersmoothie/window-splitter/pull/54) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- fix ci tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- dynamic constraints ([@hipstersmoothie](https://github.com/hipstersmoothie))
- lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- first pass ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix props spread ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix attr merging ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix style ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix conditional test ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fixing tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make id automatic by rendering once ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix unmount ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ugh ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update names ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix double conditional render layout ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- FIX BUILD ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared stuff ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared types out ([@hipstersmoothie](https://github.com/hipstersmoothie))
- conditional panels ([@hipstersmoothie](https://github.com/hipstersmoothie))
- imperative handles ([@hipstersmoothie](https://github.com/hipstersmoothie))
- controlled collapse ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more stories ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix nested ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ai ([@hipstersmoothie](https://github.com/hipstersmoothie))
- cleanup ([@hipstersmoothie](https://github.com/hipstersmoothie))
- starting to wrk ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add missing publish configs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
