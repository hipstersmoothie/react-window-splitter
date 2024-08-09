# `react-window-splitter`

A full featured window splitter for React.

- Support for the full [window splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) ARIA spec
- Support for percentage and pixel based constraints
- Collapsible panels
- Controlled panels
- Layout Persistance - LocalStorage and Cookie

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

## Server Side Rendering + Strict Mode

While not required for the simple case, for anything more complex you will
need to add an `id` prop to your panels and handles.
This is so that the component can tell all of the components apart during layout and rendering.\_createMdxContent

Features that require `id`:

- Conditional Panels
- Server Side Rendering
- React Strict Mode

## Props

### PanelGroup

| Name             | Type                        | Description                                     |
| ---------------- | --------------------------- | ----------------------------------------------- |
| children         | React.ReactNode             |                                                 |
| autosaveId       | string                      | Persisted state to initialized the machine with |
| autosaveStrategy | "localStorage" \| "cookie"  | How to save the persisted state                 |
| className        | string                      |                                                 |
| collapsible      | boolean                     |                                                 |
| collapsedSize    | Unit                        |                                                 |
| defaultCollapsed | boolean                     |                                                 |
| default          | Unit                        |                                                 |
| handle           | React.Ref<PanelGroupHandle> | Imperative handle to control the group          |
| id               | string                      |                                                 |
| orientation      | "horizontal" \| "vertical"  |                                                 |

## Prior Art

This library is heavily inspired by the following libraries:

- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)