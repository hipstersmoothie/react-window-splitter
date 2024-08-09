# `react-window-splitter`

A full featured window splitter for React.

- Support for the full [window splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) ARIA spec
- Support for percentage and pixel based constraints
- Collapsible panels
- Controlled panels
- Layout Persistance - LocalStorage and Cookie

[Read the full docs](https://react-window-splitter-six.vercel.app)

## Install

```bash
npm install react-window-splitter
yarn add react-window-splitter
pnpm add react-window-splitter
```

## Usage

```tsx
import { PanelGroup, Panel, PanelResizer } from "react-window-splitter";

function Example() {
  return (
    <PanelGroup>
      <Panel min="130px" max="400px" />
      <PanelResizer />
      <Panel min="130px" />
    </PanelGroup>
  );
}
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://hipstersmoothie.com/"><img src="https://avatars.githubusercontent.com/u/1192452?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Lisowski</b></sub></a><br /><a href="https://github.com/hipstersmoothie/react-window-splitter/commits?author=hipstersmoothie" title="Code">💻</a> <a href="https://github.com/hipstersmoothie/react-window-splitter/commits?author=hipstersmoothie" title="Documentation">📖</a> <a href="#example-hipstersmoothie" title="Examples">💡</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!