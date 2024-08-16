# `@window-splitter/state`

A state machine for a WAI-ARIA compliant window splitter.
This package can be used to build your own window splitter for a framework or even vanilla html/js.

If you're using a framework like React, you can use the `react-window-splitter` package instead.

[Read the full docs](https://react-window-splitter-six.vercel.app)

## Install

```bash
npm install @window-splitter/state
yarn add @window-splitter/state
pnpm add @window-splitter/state
```

## Usage

This is an example of how to use the machine to create a window splitter.
This is very simplified and only shows the basics of how to use the state machine.
Actually integrating with a framework would look a lot different.

In a vanilla html/js application you would have something like this:

```html
<div id="group">
  <div id="panel-1">Panel-1</div>
  <div id="resizer-1"></div>
  <div id="panel-2">Panel-2</div>
</div>
```

And then you would have some javascript to setup the state machine and send events to it.

```tsx
import {
  groupMachine,
  initializePanel,
  initializePanelHandleData,
} from "@window-splitter/state";
import { createActor } from "xstate";

// Setup the state machine
const actor = createActor(groupMachine, {
  input: { groupId: "group" },
}).start();

// Register the panels with the state machine
actor.send({
  type: "registerPanel",
  data: initializePanel({ id: "panel-1" }),
});
actor.send({
  type: "registerPanelHandle",
  data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
});
actor.send({
  type: "registerPanel",
  data: initializePanel({ id: "panel-2" }),
});

// Set the size of the group, typically measured in the browser after the initial render
actor.send({ type: "setSize", size: { width: 500, height: 200 } });
// The state machine relies on css grid to calculate the initial sizes of the panels
// This next action would be sent after measuring the initial sizes rendered by the browser
actor.send({
  type: "setActualItemsSize",
  childrenSizes: {
    "panel-1": { width: 245, height: 200 },
    "panel-2": { width: 245, height: 200 },
  },
});

// Send some events to drag a handle
actor.send({ type: "dragHandleStart", handleId: "resizer-1" });
actor.send({
  type: "dragHandle",
  handleId: "resizer-1",
  value: dragHandlePayload({ delta: 10 }),
});
actor.send({ type: "dragHandleEnd", handleId: "resizer-1" });
```

## API

### `groupMachine`

The state machine is exported as `groupMachine` and can be used to create a window splitter.

#### `groupMachine.input`

The context of the state machine is an object with the following shape:

- `orientation`: The orientation of the group. This can be either `"horizontal"` or `"vertical"`
- `groupId`: The id of the group
- `initialItems`: An array of items to initialize the group with.

#### Events

For a full list of events and their payloads see the [source code](https://github.com/hipstersmoothie/react-window-splitter/blob/main/packages/state/src/index.ts).

- `registerPanel`: Register a new panel with the state machine
- `registerDynamicPanel`: Register a new panel after the initial render
- `unregisterPanel`: Unregister a panel from the state machine
- `registerPanelHandle`: Register a new panel handle with the state machine
- `unregisterPanelHandle`: Unregister a panel handle from the state machine
- `setSize`: Set the size of the group after the initial render
- `setActualItemsSize`: Set the size of the group items after the initial render
- `setOrientation`: Set the orientation of the group
- `dragHandleStart`: Start a drag interaction
- `dragHandle`: Update the layout according to how the handle moved
- `dragHandleEnd`: End a drag interaction
- `collapsePanel`: Collapse a panel
- `expandPanel`: Expand a panel
- `setPanelPixelSize`: Set the size of a panel in pixels

### Utilities

- `buildTemplate` - Build the grid template from the item values.
- `getCollapsiblePanelForHandleId` - Get the handle closest to the target panel.
- `getGroupSize` - Get the size of the group in pixels.
- `getPanelWithId` - Get a panel with a particular ID.
- `getUnitPercentageValue` - Converts a `Unit` to a percentage of the group size.
- `getUnitPixelValue` - Converts a `Unit` to a pixel value.
- `initializePanel` - Initialize a panel for registration with the state machine.
- `InitializePanelHandleData` - Initialize a panel handle for registration with the state machine.
- `isPanelData` - Check if the provided item is a panel data object.
- `isPanelHandle` - Check if the provided item is a panel handle object.
- `parseUnit` - Parse a `Unit` from a string.
- `prepareSnapshot` - For usage with restoring a saved layout state
