# v1.2.0 (Wed Jul 08 2026)

#### 🚀 Enhancement

- `@window-splitter/react`, `@window-splitter/solid`, `@window-splitter/state`, `@window-splitter/svelte`, `@window-splitter/vue`, `@window-splitter/web-component`
  - apply animations directly to dom [#85](https://github.com/hipstersmoothie/window-splitter/pull/85) ([@hipstersmoothie](https://github.com/hipstersmoothie) [@vikr01](https://github.com/vikr01))

#### 🐛 Bug Fix

- `@window-splitter/state`
  - Also skip onUpdate on transition into togglingCollapse to remove frame-0 hitch [#86](https://github.com/hipstersmoothie/window-splitter/pull/86) ([@vikr01](https://github.com/vikr01))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Vik R ([@vikr01](https://github.com/vikr01))

---

# v1.1.4 (Mon Jun 29 2026)

#### 🐛 Bug Fix

- `@window-splitter/state`
  - fix(state): avoid overflow collapse during animation [#83](https://github.com/hipstersmoothie/window-splitter/pull/83) (andrey_okonetchnikov@crgl-thirdparty.com [@okonet](https://github.com/okonet))
  - fix: tolerate sub-pixel overflow [#84](https://github.com/hipstersmoothie/window-splitter/pull/84) ([@PawelMalakVolue](https://github.com/PawelMalakVolue))

#### Authors: 3

- [@PawelMalakVolue](https://github.com/PawelMalakVolue)
- Andrey Okonetchnikov ([@okonet](https://github.com/okonet))
- ANDREY OKONETCHNIKOV (CRGL-THIRDPARTY.COM) (andrey_okonetchnikov@crgl-thirdparty.com)

---

# v1.1.3 (Fri Jan 30 2026)

#### 🐛 Bug Fix

- `@window-splitter/state`
  - fix for animation + controlled component [#80](https://github.com/hipstersmoothie/window-splitter/pull/80) ([@chrisdrackett](https://github.com/chrisdrackett) [@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
  - Fix incorrect size comparison between new and current size [#75](https://github.com/hipstersmoothie/window-splitter/pull/75) ([@EugeneKite](https://github.com/EugeneKite))

#### Authors: 3

- [@EugeneKite](https://github.com/EugeneKite)
- Andrew Lisowski ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- Chris Drackett ([@chrisdrackett](https://github.com/chrisdrackett))

---

# v1.1.2 (Mon Jul 21 2025)

#### ⚠️ Pushed to `main`

- `@window-splitter/react`, `@window-splitter/state`
  - handle order changes (andrew.lisowski@snowflake.com)
- `@window-splitter/react`
  - use correct unmount function, not just latest (andrew.lisowski@snowflake.com)
  - type (andrew.lisowski@snowflake.com)
  - better item matching based on ids and not just indexes (andrew.lisowski@snowflake.com)
- `@window-splitter/state`
  - fix registering dynamic panel sizes with percents (andrew.lisowski@snowflake.com)

#### Authors: 1

- Andrew Lisowski (andrew.lisowski@snowflake.com)

---

# v1.1.1 (Mon Jul 14 2025)

#### 🐛 Bug Fix

- `@window-splitter/interface`, `@window-splitter/react`, `@window-splitter/solid`, `@window-splitter/state`, `@window-splitter/svelte`, `@window-splitter/vue`, `@window-splitter/web-component`
  - Fix controlled panel resize bugs and make collapse/expand awaitable [#67](https://github.com/hipstersmoothie/window-splitter/pull/67) ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- `@window-splitter/react`, `@window-splitter/state`
  - fix: parse stored default value to Big [#65](https://github.com/hipstersmoothie/window-splitter/pull/65) ([@andrefgneves](https://github.com/andrefgneves))
- `@window-splitter/react`
  - fix: Prevent React panel group data from being saved to local storage when autosaveId is not set [#66](https://github.com/hipstersmoothie/window-splitter/pull/66) ([@y4ure](https://github.com/y4ure))

#### Authors: 3

- Adam Yau ([@y4ure](https://github.com/y4ure))
- André Neves ([@andrefgneves](https://github.com/andrefgneves))
- Andrew Lisowski ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

---

# v1.1.0 (Mon May 26 2025)

#### 🚀 Enhancement

- `@window-splitter/interface`, `@window-splitter/react`, `@window-splitter/solid`, `@window-splitter/state`, `@window-splitter/svelte`, `@window-splitter/vue`, `@window-splitter/web-component`
  - Add "shiftAmount" prop [#64](https://github.com/hipstersmoothie/window-splitter/pull/64) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.0.2 (Mon May 12 2025)

#### 🐛 Bug Fix

- `@window-splitter/web-component`
  - Fix the HTML structure in the README. [#60](https://github.com/hipstersmoothie/window-splitter/pull/60) ([@justinfagnani](https://github.com/justinfagnani))

#### ⚠️ Pushed to `main`

- readme ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@window-splitter/web-component`
  - use properties correclty ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Justin Fagnani ([@justinfagnani](https://github.com/justinfagnani))

---

# v0.8.7 (Sun May 11 2025)

#### 🐛 Bug Fix

- `@window-splitter/interface`, `@window-splitter/solid`, `@window-splitter/state`, `@window-splitter/svelte`, `@window-splitter/vue`, `@window-splitter/web-component`
  - Web Component [#59](https://github.com/hipstersmoothie/window-splitter/pull/59) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add license ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix api docs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.6 (Sun May 04 2025)

#### ⚠️ Pushed to `main`

- `@window-splitter/vue`
  - add readme ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.5 (Sun May 04 2025)

#### 🐛 Bug Fix

- `@window-splitter/interface`, `@window-splitter/react`, `@window-splitter/solid`, `@window-splitter/state`, `@window-splitter/svelte`, `@window-splitter/vue`
  - Vue Adapter [#56](https://github.com/hipstersmoothie/window-splitter/pull/56) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- `@window-splitter/vue`
  - add publish info ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@window-splitter/svelte`
  - add link ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.4 (Sat May 03 2025)

#### 🐛 Bug Fix

- `@window-splitter/solid`, `@window-splitter/state`, `@window-splitter/svelte`
  - Svelte Adapter [#55](https://github.com/hipstersmoothie/window-splitter/pull/55) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.3 (Tue Apr 29 2025)

#### ⚠️ Pushed to `main`

- `@window-splitter/interface`, `@window-splitter/react`, `@window-splitter/solid`, `@window-splitter/state`
  - fix repo links ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.2 (Tue Apr 29 2025)

#### ⚠️ Pushed to `main`

- `@window-splitter/solid`
  - fix import (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.8.1 (Mon Apr 28 2025)

#### ⚠️ Pushed to `main`

- `@window-splitter/solid`
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

- `@window-splitter/interface`, `@window-splitter/react`, `@window-splitter/solid`, `@window-splitter/state`
  - `@window-splitter/solid` [#54](https://github.com/hipstersmoothie/window-splitter/pull/54) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- simplify unmount logic [#53](https://github.com/hipstersmoothie/window-splitter/pull/53) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- `@window-splitter/react`, `@window-splitter/solid`
  - add missing publish configs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.5 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- `react-window-splitter`
  - Fix conditional panel flicker [#52](https://github.com/hipstersmoothie/window-splitter/pull/52) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.4 (Sat Apr 26 2025)

#### ⚠️ Pushed to `main`

- `@window-splitter/state`
  - slim down raf ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.3 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- `react-window-splitter`
  - remove reforrest [#51](https://github.com/hipstersmoothie/window-splitter/pull/51) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.2 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - bake in invariant [#50](https://github.com/hipstersmoothie/window-splitter/pull/50) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.1 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - remove tiny-cookie as runtime dep [#49](https://github.com/hipstersmoothie/window-splitter/pull/49) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- `@window-splitter/state`
  - handle transition to new stored state better ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`
  - fix stats calculation for bundle size ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.0 (Fri Apr 25 2025)

### Release Notes

#### No xstate ([#47](https://github.com/hipstersmoothie/window-splitter/pull/47))

This release is a dramatic reduction to the bundle size. This was done by pruning some unnecessary deps and some that were to large to justify in the headless component.

The biggest change is to `@window-splitter/state` where we refactored the state machine into a function that followed the logic of the state machine, taking careful aim to not give up any of the guarantees we had there. As a result the apis for `snapshot` changed since those were exposing `xstate`'s snapshots. The format is now just the context value, which is also a smaller amount of text than we were storing for snapshots.

That change is breaking. The version has only received a minor bump because we are still <0, where bumping the minor can include breaking changes.

---

#### 🚀 Enhancement

- `react-window-splitter`, `@window-splitter/state`
  - No xstate [#47](https://github.com/hipstersmoothie/window-splitter/pull/47) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- `react-window-splitter`
  - bundle size [#48](https://github.com/hipstersmoothie/window-splitter/pull/48) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.5.8 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `react-window-splitter`
  - more utils from utils (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.7 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `react-window-splitter`
  - move back to utils package and use more hooks from it (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.6 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `react-window-splitter`
  - remove utils (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.5 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `@window-splitter/state`
  - fix collapse animation breaking state machine ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.5.4 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `react-window-splitter`
  - unused (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.3 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `react-window-splitter`, `@window-splitter/state`
  - tiny cookie (lisowski54@gmail.com)
- `react-window-splitter`
  - fix tests (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.2 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `react-window-splitter`, `@window-splitter/state`
  - switch to tiny-invariant (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.1 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- `react-window-splitter`
  - fix deps (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.0 (Thu Apr 17 2025)

#### 🚀 Enhancement

- `react-window-splitter`, `@window-splitter/state`
  - Add `data-state=inactive` for drag handles that aren't the active one [#46](https://github.com/hipstersmoothie/window-splitter/pull/46) ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

#### Authors: 1

- Andrew Lisowski ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

---

# v0.4.3 (Tue Apr 15 2025)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - update panel settings when props update [#45](https://github.com/hipstersmoothie/window-splitter/pull/45) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.4.2 (Tue Apr 15 2025)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - rebind onResize and onCollapseChange to fix restoring from snapshot [#44](https://github.com/hipstersmoothie/window-splitter/pull/44) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- fix docs example ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- add imperative api example [#43](https://github.com/hipstersmoothie/window-splitter/pull/43) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.4.1 (Sun Aug 25 2024)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - Responsive Bugs [#38](https://github.com/hipstersmoothie/window-splitter/pull/38) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - move autosave to state package [#36](https://github.com/hipstersmoothie/window-splitter/pull/36) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.4.0 (Fri Aug 23 2024)

#### 🚀 Enhancement

- `react-window-splitter`, `@window-splitter/state`
  - Add "isStaticAtRest" prop [#34](https://github.com/hipstersmoothie/window-splitter/pull/34) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Collapse Validation [#33](https://github.com/hipstersmoothie/window-splitter/pull/33) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- Add view on github button to landing page [#35](https://github.com/hipstersmoothie/window-splitter/pull/35) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.2 (Wed Aug 21 2024)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - Fix panel not expanding to take up width with a default collapsed panel [#29](https://github.com/hipstersmoothie/window-splitter/pull/29) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Fix bug in onResize callbacks [#30](https://github.com/hipstersmoothie/window-splitter/pull/30) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.1 (Sun Aug 18 2024)

#### ⚠️ Pushed to `main`

- fix docs build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`
  - fix drag callback types ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@window-splitter/state`
  - fix mutating context ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.0 (Sun Aug 18 2024)

#### 🚀 Enhancement

- `react-window-splitter`, `@window-splitter/state`
  - Add `onResize` prop to Panel [#28](https://github.com/hipstersmoothie/window-splitter/pull/28) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`
  - feat: add callbacks for drag interaction [#27](https://github.com/hipstersmoothie/window-splitter/pull/27) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- `@window-splitter/state`
  - 100 [#26](https://github.com/hipstersmoothie/window-splitter/pull/26) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`, `@window-splitter/state`
  - add coverage for PRs [#25](https://github.com/hipstersmoothie/window-splitter/pull/25) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Add react tests [#24](https://github.com/hipstersmoothie/window-splitter/pull/24) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- `react-window-splitter`, `@window-splitter/state`
  - improve test coverage in state machine ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.5 (Thu Aug 15 2024)

#### ⚠️ Pushed to `main`

- `react-window-splitter`, `@window-splitter/state`
  - add more docs to state machine + add defaults to params ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix repo/description ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - upgrade deps ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.4 (Thu Aug 15 2024)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - Fix conditional panel rendering [#22](https://github.com/hipstersmoothie/window-splitter/pull/22) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Fix default size throwing of responsive sizing [#21](https://github.com/hipstersmoothie/window-splitter/pull/21) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.3 (Wed Aug 14 2024)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - More Tests and Bug Fixes [#18](https://github.com/hipstersmoothie/window-splitter/pull/18) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.2 (Tue Aug 13 2024)

#### 🐛 Bug Fix

- `react-window-splitter`, `@window-splitter/state`
  - Split out @window-splitter/state [#16](https://github.com/hipstersmoothie/window-splitter/pull/16) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- add storybook link [#14](https://github.com/hipstersmoothie/window-splitter/pull/14) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.1 (Tue Aug 13 2024)

#### 🐛 Bug Fix

- `react-window-splitter`
  - Add tests, fix a bunch of bugs [#12](https://github.com/hipstersmoothie/window-splitter/pull/12) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix react preset in config-eslint package [#11](https://github.com/hipstersmoothie/window-splitter/pull/11) ([@Rel1cx](https://github.com/Rel1cx))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Eva1ent ([@Rel1cx](https://github.com/Rel1cx))

---

# v0.2.0 (Sat Aug 10 2024)

#### 🚀 Enhancement

- `react-window-splitter`
  - Collapse Animation [#10](https://github.com/hipstersmoothie/window-splitter/pull/10) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.8 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- init all contributors (lisowski54@gmail.com)
- remove todo.md (lisowski54@gmail.com)
- try this (lisowski54@gmail.com)
- add root readme (lisowski54@gmail.com)
- `react-window-splitter`
  - mark package as side effect free (lisowski54@gmail.com)
  - lints (lisowski54@gmail.com)
  - use different eslint plugin (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.8 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- remove todo.md ([@hipstersmoothie](https://github.com/hipstersmoothie))
- try this ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add root readme ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`
  - mark package as side effect free ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - lints ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - use different eslint plugin ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.8 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- remove todo.md ([@hipstersmoothie](https://github.com/hipstersmoothie))
- try this ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add root readme ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`
  - mark package as side effect free ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - lints ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - use different eslint plugin ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.7 (Fri Aug 09 2024)

---

# v0.1.6 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- `react-window-splitter`
  - fix readme (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.1.5 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- `react-window-splitter`
  - try to get readme rendering ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.3 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- put auto config in package.json ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove ([@hipstersmoothie](https://github.com/hipstersmoothie))
- try making them mdx files ([@hipstersmoothie](https://github.com/hipstersmoothie))
- include all examples - 2 ([@hipstersmoothie](https://github.com/hipstersmoothie))
- include all examples ([@hipstersmoothie](https://github.com/hipstersmoothie))
- switch to mdx pages ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix content match ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add missing deps ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`
  - cleanup readme ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - add links ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix linting ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - add basic readme ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix peer dep warnings ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix build locally ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - add engine ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.3 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- put auto config in package.json (lisowski54@gmail.com)
- remove (lisowski54@gmail.com)
- try making them mdx files (lisowski54@gmail.com)
- include all examples - 2 (lisowski54@gmail.com)
- include all examples (lisowski54@gmail.com)
- switch to mdx pages (lisowski54@gmail.com)
- fix content match (lisowski54@gmail.com)
- add missing deps (lisowski54@gmail.com)
- `react-window-splitter`
  - cleanup readme (lisowski54@gmail.com)
  - add links (lisowski54@gmail.com)
  - fix linting (lisowski54@gmail.com)
  - add basic readme (lisowski54@gmail.com)
  - fix peer dep warnings (lisowski54@gmail.com)
  - fix build locally (lisowski54@gmail.com)
  - add engine (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.2 (Thu Aug 08 2024)

#### ⚠️ Pushed to `main`

- add build to release script (lisowski54@gmail.com)
- remove extra version (lisowski54@gmail.com)
- `react-window-splitter`
  - ship only needed files (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.1.1 (Thu Aug 08 2024)

#### 🐛 Bug Fix

- `react-window-splitter`
  - pr workflow [#1](https://github.com/hipstersmoothie/window-splitter/pull/1) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add lerna ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add prior art page ([@hipstersmoothie](https://github.com/hipstersmoothie))
- spacing ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add code exampl ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move examples ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add note about ssr ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add another example ([@hipstersmoothie](https://github.com/hipstersmoothie))
- lean into mdxts more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- flesh out home page ([@hipstersmoothie](https://github.com/hipstersmoothie))
- use radix colors ([@hipstersmoothie](https://github.com/hipstersmoothie))
- rename ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make it look cool ([@hipstersmoothie](https://github.com/hipstersmoothie))
- convert to app router ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove unecassary thigns ([@hipstersmoothie](https://github.com/hipstersmoothie))
- improve style a little ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix SSR ([@hipstersmoothie](https://github.com/hipstersmoothie))
- init docs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add autosaving ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ai improvements ([@hipstersmoothie](https://github.com/hipstersmoothie))
- shorten code ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove template from state machine ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add disabled prop to handle ([@hipstersmoothie](https://github.com/hipstersmoothie))
- finish up resizer API ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add some comments ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add setSizes ([@hipstersmoothie](https://github.com/hipstersmoothie))
- improve regions ([@hipstersmoothie](https://github.com/hipstersmoothie))
- implement panel group imperative getters ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix controlled panel erroring ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add docs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add dynamic rendering support ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add regions ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix resizing ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add leftover space handling back ([@hipstersmoothie](https://github.com/hipstersmoothie))
- simplify ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add imperative panel api ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add react refs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add cursor ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add default collapse size ([@hipstersmoothie](https://github.com/hipstersmoothie))
- controlled collapse prop ([@hipstersmoothie](https://github.com/hipstersmoothie))
- improve "enter to collapse" ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix error ([@hipstersmoothie](https://github.com/hipstersmoothie))
- implement "enter" to toggle collapse ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make shift resize more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make handles more accessible ([@hipstersmoothie](https://github.com/hipstersmoothie))
- improve collapse ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add todo ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add overflow example ([@hipstersmoothie](https://github.com/hipstersmoothie))
- account for drag overshoots ([@hipstersmoothie](https://github.com/hipstersmoothie))
- improve drags ([@hipstersmoothie](https://github.com/hipstersmoothie))
- get pushing working ([@hipstersmoothie](https://github.com/hipstersmoothie))
- kinda working ([@hipstersmoothie](https://github.com/hipstersmoothie))
- init ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `react-window-splitter`
  - setup auto ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - document imperative API ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - get persistence working ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - tools ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix stories ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - rename files ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - automatic order ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - conditional working ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - get it working better with SSR ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - improve conditional panels more ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix react warnings ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - conditional panels kinda ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - working on docs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
