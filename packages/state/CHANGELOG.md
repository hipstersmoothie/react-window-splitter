# v1.2.0 (Wed Jul 08 2026)

#### 🚀 Enhancement

- apply animations directly to dom [#85](https://github.com/hipstersmoothie/window-splitter/pull/85) ([@hipstersmoothie](https://github.com/hipstersmoothie) [@vikr01](https://github.com/vikr01))

#### 🐛 Bug Fix

- Also skip onUpdate on transition into togglingCollapse to remove frame-0 hitch [#86](https://github.com/hipstersmoothie/window-splitter/pull/86) ([@vikr01](https://github.com/vikr01))
- Propagate DOM-write skip up to send() and add regression test ([@vikr01](https://github.com/vikr01))
- Also skip onUpdate on transition into togglingCollapse to remove frame-0 hitch ([@vikr01](https://github.com/vikr01))
- apply animations directly to dom ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Vik R ([@vikr01](https://github.com/vikr01))

---

# v1.1.4 (Mon Jun 29 2026)

#### 🐛 Bug Fix

- fix(state): avoid overflow collapse during animation [#83](https://github.com/hipstersmoothie/window-splitter/pull/83) (andrey_okonetchnikov@crgl-thirdparty.com [@okonet](https://github.com/okonet))
- fix: tolerate sub-pixel overflow [#84](https://github.com/hipstersmoothie/window-splitter/pull/84) ([@PawelMalakVolue](https://github.com/PawelMalakVolue))
- fix: tolerate sub-pixel overflow ([@PawelMalakVolue](https://github.com/PawelMalakVolue))
- fix(state): avoid overflow collapse during animation (andrey_okonetchnikov@crgl-thirdparty.com)

#### Authors: 3

- [@PawelMalakVolue](https://github.com/PawelMalakVolue)
- Andrey Okonetchnikov ([@okonet](https://github.com/okonet))
- ANDREY OKONETCHNIKOV (CRGL-THIRDPARTY.COM) (andrey_okonetchnikov@crgl-thirdparty.com)

---

# v1.1.3 (Fri Jan 30 2026)

#### 🐛 Bug Fix

- fix for animation + controlled component [#80](https://github.com/hipstersmoothie/window-splitter/pull/80) ([@chrisdrackett](https://github.com/chrisdrackett) [@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- add a test that fails before the change ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- Fix incorrect size comparison between new and current size [#75](https://github.com/hipstersmoothie/window-splitter/pull/75) ([@EugeneKite](https://github.com/EugeneKite))
- fix for animation + controlled component ([@chrisdrackett](https://github.com/chrisdrackett))
- Fix incorrect size comparison between new and current size ([@EugeneKite](https://github.com/EugeneKite))

#### Authors: 3

- [@EugeneKite](https://github.com/EugeneKite)
- Andrew Lisowski ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- Chris Drackett ([@chrisdrackett](https://github.com/chrisdrackett))

---

# v1.1.2 (Mon Jul 21 2025)

#### ⚠️ Pushed to `main`

- handle order changes (andrew.lisowski@snowflake.com)
- fix registering dynamic panel sizes with percents (andrew.lisowski@snowflake.com)

#### Authors: 1

- Andrew Lisowski (andrew.lisowski@snowflake.com)

---

# v1.1.1 (Mon Jul 14 2025)

#### 🐛 Bug Fix

- Fix controlled panel resize bugs and make collapse/expand awaitable [#67](https://github.com/hipstersmoothie/window-splitter/pull/67) ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- round it ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- tests ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix: parse stored default value to Big [#65](https://github.com/hipstersmoothie/window-splitter/pull/65) ([@andrefgneves](https://github.com/andrefgneves))
- comments ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix lint ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix some controlled panel bugs ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- awaitable colllapse ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- find panel with space ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- always use active drag handle if there is one during controlled collapse ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix subsequent panels not being able to be uncollapsed sometimes ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix subsequent collapsed panels not toggling collapse ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
- fix: parse stored default value to Big ([@andrefgneves](https://github.com/andrefgneves))

#### Authors: 2

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

# v0.8.7 (Sun May 11 2025)

#### 🐛 Bug Fix

- Web Component [#59](https://github.com/hipstersmoothie/window-splitter/pull/59) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- start ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.5 (Sun May 04 2025)

#### 🐛 Bug Fix

- Vue Adapter [#56](https://github.com/hipstersmoothie/window-splitter/pull/56) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix controlled panel can exapand calca ([@hipstersmoothie](https://github.com/hipstersmoothie))
- catalogs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.4 (Sat May 03 2025)

#### 🐛 Bug Fix

- Svelte Adapter [#55](https://github.com/hipstersmoothie/window-splitter/pull/55) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- builds ([@hipstersmoothie](https://github.com/hipstersmoothie))
- clean up type errors ([@hipstersmoothie](https://github.com/hipstersmoothie))
- conditional ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix uncontrolled collapse callback not being called ([@hipstersmoothie](https://github.com/hipstersmoothie))
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
- ugh ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update names ([@hipstersmoothie](https://github.com/hipstersmoothie))
- use shared move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix double conditional render layout ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared stuff ([@hipstersmoothie](https://github.com/hipstersmoothie))
- controlled collapse ([@hipstersmoothie](https://github.com/hipstersmoothie))
- starting to wrk ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.4 (Sat Apr 26 2025)

#### ⚠️ Pushed to `main`

- slim down raf ([@hipstersmoothie](https://github.com/hipstersmoothie))

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
- remove tiny-cookie as runtime dep ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- handle transition to new stored state better ([@hipstersmoothie](https://github.com/hipstersmoothie))

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

- fix last bug ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more test fixes ([@hipstersmoothie](https://github.com/hipstersmoothie))
- lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix all tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- w2 ([@hipstersmoothie](https://github.com/hipstersmoothie))
- working ([@hipstersmoothie](https://github.com/hipstersmoothie))
- start ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.5.5 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- fix collapse animation breaking state machine ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.5.3 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- tiny cookie (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.2 (Wed Apr 23 2025)

#### ⚠️ Pushed to `main`

- switch to tiny-invariant (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v0.5.0 (Thu Apr 17 2025)

#### 🚀 Enhancement

- Add `data-state=inactive` for drag handles that aren't the active one [#46](https://github.com/hipstersmoothie/window-splitter/pull/46) ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))

#### 🐛 Bug Fix

- fix test ([@sfc-gh-alisowski](https://github.com/sfc-gh-alisowski))
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
- rebind onResize and onCollapseChange to fix restoring from snapshot (closes #41) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.4.1 (Sun Aug 25 2024)

#### 🐛 Bug Fix

- Responsive Bugs [#38](https://github.com/hipstersmoothie/window-splitter/pull/38) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move handle overflow logic to recordActualItemSize ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update test ([@hipstersmoothie](https://github.com/hipstersmoothie))
- updating tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- measure more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add fill panel. improves resizing a lot ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move autosave to state package [#36](https://github.com/hipstersmoothie/window-splitter/pull/36) ([@hipstersmoothie](https://github.com/hipstersmoothie))
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

- Add "isStaticAtRest" prop ([@hipstersmoothie](https://github.com/hipstersmoothie))
- simplify types ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix panel expandsion to min ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- get keyboard collapse logic working too ([@hipstersmoothie](https://github.com/hipstersmoothie))
- cleaner ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix being able to drag past a min ([@hipstersmoothie](https://github.com/hipstersmoothie))
- auto collapse panels when there is no room ([@hipstersmoothie](https://github.com/hipstersmoothie))
- loosen check to include panels that might be too big ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix bad percent calc ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix comparisions ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.2 (Wed Aug 21 2024)

#### 🐛 Bug Fix

- Fix panel not expanding to take up width with a default collapsed panel [#29](https://github.com/hipstersmoothie/window-splitter/pull/29) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix panel not expanding to take up width with a default collapsed panel ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix bug in onResize callbacks [#30](https://github.com/hipstersmoothie/window-splitter/pull/30) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- call onResize once the item sizes are known too ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix pixel calculation on onResize ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix inconsistent percent value structure ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.1 (Sun Aug 18 2024)

#### ⚠️ Pushed to `main`

- fix mutating context ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.3.0 (Sun Aug 18 2024)

#### 🚀 Enhancement

- Add `onResize` prop to Panel [#28](https://github.com/hipstersmoothie/window-splitter/pull/28) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- Add `onResize` prop to `Panel` ([@hipstersmoothie](https://github.com/hipstersmoothie))
- 100 [#26](https://github.com/hipstersmoothie/window-splitter/pull/26) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- 100 ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add coverage for PRs [#25](https://github.com/hipstersmoothie/window-splitter/pull/25) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- testing ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add coverage for PRs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add react tests [#24](https://github.com/hipstersmoothie/window-splitter/pull/24) ([@hipstersmoothie](https://github.com/hipstersmoothie))
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
- fix overshoot math for non-collapsible panels ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove unused deps ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move prepareSnapshot ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix spring animations not quite working (for real) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- inline easings ([@hipstersmoothie](https://github.com/hipstersmoothie))
- no more bugs? ([@hipstersmoothie](https://github.com/hipstersmoothie))
- switch to big number ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix animation float math (closes #15) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- test space distribution and fix max panels used when they shouldn't ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.2.2 (Tue Aug 13 2024)

#### 🐛 Bug Fix

- Split out @window-splitter/state [#16](https://github.com/hipstersmoothie/window-splitter/pull/16) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make state public ([@hipstersmoothie](https://github.com/hipstersmoothie))
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
