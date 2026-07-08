# v1.2.0 (Wed Jul 08 2026)

#### 🚀 Enhancement

- apply animations directly to dom [#85](https://github.com/hipstersmoothie/window-splitter/pull/85) ([@hipstersmoothie](https://github.com/hipstersmoothie) [@vikr01](https://github.com/vikr01))

#### 🐛 Bug Fix

- apply animations directly to dom ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Vik R ([@vikr01](https://github.com/vikr01))

---

# v1.1.2 (Mon Jul 21 2025)

#### ⚠️ Pushed to `main`

- handle order changes (andrew.lisowski@snowflake.com)
- use correct unmount function, not just latest (andrew.lisowski@snowflake.com)
- type (andrew.lisowski@snowflake.com)
- better item matching based on ids and not just indexes (andrew.lisowski@snowflake.com)

#### Authors: 1

- Andrew Lisowski (andrew.lisowski@snowflake.com)

---

# v1.1.1 (Mon Jul 14 2025)

#### 🐛 Bug Fix

- Fix controlled panel resize bugs and make collapse/expand awaitable [#67](https://github.com/hipstersmoothie/window-splitter/pull/67) ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- tests ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix: parse stored default value to Big [#65](https://github.com/hipstersmoothie/window-splitter/pull/65) ([@andrefgneves](https://github.com/andrefgneves))
- fix: Prevent React panel group data from being saved to local storage when autosaveId is not set [#66](https://github.com/hipstersmoothie/window-splitter/pull/66) ([@y4ure](https://github.com/y4ure))
- fix lint ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- self code review ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix some controlled panel bugs ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- typo ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- awaitable colllapse ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix: Prevent React panel group data from being saved to local storage when autosaveId is unset ([@y4ure](https://github.com/y4ure))
- fix: parse stored default value to Big ([@andrefgneves](https://github.com/andrefgneves))

#### Authors: 3

- Adam Yau ([@y4ure](https://github.com/y4ure))
- André Neves ([@andrefgneves](https://github.com/andrefgneves))
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

# v0.8.5 (Sun May 04 2025)

#### 🐛 Bug Fix

- Vue Adapter [#56](https://github.com/hipstersmoothie/window-splitter/pull/56) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- catalogs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.3 (Tue Apr 29 2025)

#### ⚠️ Pushed to `main`

- fix repo links ([@hipstersmoothie](https://github.com/hipstersmoothie))

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

- dynamic constraints ([@hipstersmoothie](https://github.com/hipstersmoothie))
- lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix attr merging ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make id automatic by rendering once ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ugh ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update names ([@hipstersmoothie](https://github.com/hipstersmoothie))
- build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- use shared move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix double conditional render layout ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared stuff ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared types out ([@hipstersmoothie](https://github.com/hipstersmoothie))
- starting to wrk ([@hipstersmoothie](https://github.com/hipstersmoothie))
- change folder name ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add missing publish configs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.5 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- Fix conditional panel flicker [#52](https://github.com/hipstersmoothie/window-splitter/pull/52) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix conditional panel flicker ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.3 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- remove reforrest [#51](https://github.com/hipstersmoothie/window-splitter/pull/51) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove reforrest ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.2 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- bake in invariant [#50](https://github.com/hipstersmoothie/window-splitter/pull/50) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- bake in invariant ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.1 (Sat Apr 26 2025)

#### 🐛 Bug Fix

- remove tiny-cookie as runtime dep [#49](https://github.com/hipstersmoothie/window-splitter/pull/49) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove html file from bundle check ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove tiny-cookie as runtime dep ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

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

- No xstate [#47](https://github.com/hipstersmoothie/window-splitter/pull/47) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- test ([@hipstersmoothie](https://github.com/hipstersmoothie))
- bundle size [#48](https://github.com/hipstersmoothie/window-splitter/pull/48) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix it? ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more test fixes ([@hipstersmoothie](https://github.com/hipstersmoothie))
- lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix all tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- w2 ([@hipstersmoothie](https://github.com/hipstersmoothie))
- working ([@hipstersmoothie](https://github.com/hipstersmoothie))
- start ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.5.8 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- more utils from utils (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.6 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- remove utils (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.4 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- unused (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.3 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- tiny cookie (lisowski54@gmail.com)
- fix tests (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.2 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- switch to tiny-invariant (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.1 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- fix deps (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.0 (Thu Apr 17 2025)

#### 🚀 Enhancement

- Add `data-state=inactive` for drag handles that aren't the active one [#46](https://github.com/hipstersmoothie/window-splitter/pull/46) ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

#### 🐛 Bug Fix

- Add `data-state=inactive` for drag handles that aren't the active one ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

#### Authors: 1

- Andrew Lisowski ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

---

# v0.4.3 (Tue Apr 15 2025)

#### 🐛 Bug Fix

- update panel settings when props update [#45](https://github.com/hipstersmoothie/window-splitter/pull/45) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update panel settings when props update ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.4.2 (Tue Apr 15 2025)

#### 🐛 Bug Fix

- rebind onResize and onCollapseChange to fix restoring from snapshot [#44](https://github.com/hipstersmoothie/window-splitter/pull/44) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove only ([@hipstersmoothie](https://github.com/hipstersmoothie))
- rebind onResize and onCollapseChange to fix restoring from snapshot (closes #41) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.4.1 (Sun Aug 25 2024)

#### 🐛 Bug Fix

- Responsive Bugs [#38](https://github.com/hipstersmoothie/window-splitter/pull/38) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move handle overflow logic to recordActualItemSize ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix? ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix rounding errors ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update test ([@hipstersmoothie](https://github.com/hipstersmoothie))
- stop re-run ([@hipstersmoothie](https://github.com/hipstersmoothie))
- updating tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- measure more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix resize/overflow bug where if a panel hits 0 it stays at 0 ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make story use view height ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move autosave to state package [#36](https://github.com/hipstersmoothie/window-splitter/pull/36) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- improve lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move autosave to state ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.4.0 (Fri Aug 23 2024)

#### 🚀 Enhancement

- Add "isStaticAtRest" prop [#34](https://github.com/hipstersmoothie/window-splitter/pull/34) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Collapse Validation [#33](https://github.com/hipstersmoothie/window-splitter/pull/33) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- fix lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add "isStaticAtRest" prop ([@hipstersmoothie](https://github.com/hipstersmoothie))
- pray ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix install? ([@hipstersmoothie](https://github.com/hipstersmoothie))
- only use generated id when necassary ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix panel expandsion to min ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix bad measure ments ([@hipstersmoothie](https://github.com/hipstersmoothie))
- auto collapse panels when there is no room ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.2 (Wed Aug 21 2024)

#### 🐛 Bug Fix

- Fix panel not expanding to take up width with a default collapsed panel [#29](https://github.com/hipstersmoothie/window-splitter/pull/29) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix panel not expanding to take up width with a default collapsed panel ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix bug in onResize callbacks [#30](https://github.com/hipstersmoothie/window-splitter/pull/30) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- call onResize once the item sizes are known too ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.1 (Sun Aug 18 2024)

#### ⚠️ Pushed to `main`

- fix drag callback types ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.0 (Sun Aug 18 2024)

#### 🚀 Enhancement

- Add `onResize` prop to Panel [#28](https://github.com/hipstersmoothie/window-splitter/pull/28) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: add callbacks for drag interaction [#27](https://github.com/hipstersmoothie/window-splitter/pull/27) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- Add `onResize` prop to `Panel` ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add callbacks for drag interaction ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add coverage for PRs [#25](https://github.com/hipstersmoothie/window-splitter/pull/25) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- testing ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add coverage for PRs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add react tests [#24](https://github.com/hipstersmoothie/window-splitter/pull/24) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make vertical test pass in CI better ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix 1 test ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add docs for state machine usage ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- improve test coverage in state machine ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.5 (Thu Aug 15 2024)

#### ⚠️ Pushed to `main`

- add more docs to state machine + add defaults to params ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix repo/description ([@hipstersmoothie](https://github.com/hipstersmoothie))
- upgrade deps ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.4 (Thu Aug 15 2024)

#### 🐛 Bug Fix

- Fix conditional panel rendering [#22](https://github.com/hipstersmoothie/window-splitter/pull/22) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix conditional panel rendering ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix default size throwing of responsive sizing [#21](https://github.com/hipstersmoothie/window-splitter/pull/21) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix default size throwing of responsive sizing ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.3 (Wed Aug 14 2024)

#### 🐛 Bug Fix

- More Tests and Bug Fixes [#18](https://github.com/hipstersmoothie/window-splitter/pull/18) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move prepareSnapshot ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix spring animations not quite working (for real) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix snapshots ([@hipstersmoothie](https://github.com/hipstersmoothie))
- switch to big number ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.2 (Tue Aug 13 2024)

#### 🐛 Bug Fix

- Split out @window-splitter/state [#16](https://github.com/hipstersmoothie/window-splitter/pull/16) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix path ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix lock ([@hipstersmoothie](https://github.com/hipstersmoothie))
- split into packages ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.1 (Tue Aug 13 2024)

#### 🐛 Bug Fix

- Add tests, fix a bunch of bugs [#12](https://github.com/hipstersmoothie/window-splitter/pull/12) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix imperative api bugs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix ordering being off ([@hipstersmoothie](https://github.com/hipstersmoothie))
- pre-parse units ([@hipstersmoothie](https://github.com/hipstersmoothie))
- stores actual values and don't convert between string and number, makes code more type safe ([@hipstersmoothie](https://github.com/hipstersmoothie))
- simpler ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add another collapse test ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add collapse tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix handles not being accounted for when adding dynamic panels ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix conditional panel rendering ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix commited layout ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Merge remote-tracking branch 'origin/main' into tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix react preset in config-eslint package [#11](https://github.com/hipstersmoothie/window-splitter/pull/11) ([@Rel1cx](https://github.com/Rel1cx))
- switch to 1fr and fix measurement in tests (closes #3) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- set initial children sizes ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix react preset in config-eslint package ([@Rel1cx](https://github.com/Rel1cx))
- add no-shadow ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix id-less renders ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add test plan ([@hipstersmoothie](https://github.com/hipstersmoothie))
- clean up test API ([@hipstersmoothie](https://github.com/hipstersmoothie))
- try rounding values during prepare phase ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix default sized panels not be properly accounted for in static widths ([@hipstersmoothie](https://github.com/hipstersmoothie))
- working ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix default size + remove some dead code ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix drag overshoot bugs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- setup tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove console ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Eva1ent ([@Rel1cx](https://github.com/Rel1cx))

---

# v0.2.0 (Sat Aug 10 2024)

#### 🚀 Enhancement

- Collapse Animation [#10](https://github.com/hipstersmoothie/window-splitter/pull/10) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- fix controlled collapse ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make it a div so the styling is easier ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add cos for animation ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add custom ease functions ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add ability to specify duration ([@hipstersmoothie](https://github.com/hipstersmoothie))
- only support a few ([@hipstersmoothie](https://github.com/hipstersmoothie))
- get animation working well ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add more animations ([@hipstersmoothie](https://github.com/hipstersmoothie))
- get collapsing working better ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add animation prop to Panel ([@hipstersmoothie](https://github.com/hipstersmoothie))
- use rafz ([@hipstersmoothie](https://github.com/hipstersmoothie))
- get a basic animation working ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix old collapsed value getting clear for controlled collapse ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix extra props in dom ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.8 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- mark package as side effect free ([@hipstersmoothie](https://github.com/hipstersmoothie))
- lints ([@hipstersmoothie](https://github.com/hipstersmoothie))
- use different eslint plugin ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.7 (Fri Aug 09 2024)

#### 🐛 Bug Fix

- Bump version to: v0.1.6 \[skip ci\] ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.6 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- fix readme (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.1.5 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

- try to get readme rendering ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.1.3 (Fri Aug 09 2024)

#### ⚠️ Pushed to `main`

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

- ship only needed files (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.1.1 (Thu Aug 08 2024)

#### 🐛 Bug Fix

- pr workflow [#1](https://github.com/hipstersmoothie/window-splitter/pull/1) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- pr workflow ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

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
