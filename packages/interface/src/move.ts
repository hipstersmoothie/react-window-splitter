// import {disableTextSelection, restoreTextSelection}  from './textSelection';

export interface MoveResult {
  /** Props to spread on the target element. */
  moveProps: {
    onPointerDown: (e: PointerEvent) => void;
    onKeyDown: (e: KeyboardEvent) => void;
  };
}

interface EventBase {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

type PointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual";

interface BaseMoveEvent {
  /** The pointer type that triggered the move event. */
  pointerType: PointerType;
  /** Whether the shift keyboard modifier was held during the move event. */
  shiftKey: boolean;
  /** Whether the ctrl keyboard modifier was held during the move event. */
  ctrlKey: boolean;
  /** Whether the meta keyboard modifier was held during the move event. */
  metaKey: boolean;
  /** Whether the alt keyboard modifier was held during the move event. */
  altKey: boolean;
}

interface MoveStartEvent extends BaseMoveEvent {
  /** The type of move event being fired. */
  type: "movestart";
}

interface MoveMoveEvent extends BaseMoveEvent {
  /** The type of move event being fired. */
  type: "move";
  /** The amount moved in the X direction since the last event. */
  deltaX: number;
  /** The amount moved in the Y direction since the last event. */
  deltaY: number;
}

interface MoveEndEvent extends BaseMoveEvent {
  /** The type of move event being fired. */
  type: "moveend";
}

export interface MoveEvents {
  /** Handler that is called when a move interaction starts. */
  onMoveStart?: (e: MoveStartEvent) => void;
  /** Handler that is called when the element is moved. */
  onMove?: (e: MoveMoveEvent) => void;
  /** Handler that is called when a move interaction ends. */
  onMoveEnd?: (e: MoveEndEvent) => void;
}

/**
 * Handles move interactions across mouse, touch, and keyboard, including dragging with
 * the mouse or touch, and using the arrow keys. Normalizes behavior across browsers and
 * platforms, and ignores emulated mouse events on touch devices.
 */
export function move(props: MoveEvents): MoveResult {
  const { onMoveStart, onMove: onMoveProp, onMoveEnd } = props;

  const state = { didMove: false, lastPosition: null, id: null } as {
    didMove: boolean;
    lastPosition: { pageX: number; pageY: number } | null;
    id: number | null;
  };

  const onMove = (
    originalEvent: EventBase,
    pointerType: PointerType,
    deltaX: number,
    deltaY: number,
  ) => {
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    if (!state.didMove) {
      state.didMove = true;
      onMoveStart?.({
        type: "movestart",
        pointerType,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey,
      });
    }
    onMoveProp?.({
      type: "move",
      pointerType,
      deltaX: deltaX,
      deltaY: deltaY,
      shiftKey: originalEvent.shiftKey,
      metaKey: originalEvent.metaKey,
      ctrlKey: originalEvent.ctrlKey,
      altKey: originalEvent.altKey,
    });
  };

  const end = (originalEvent: EventBase, pointerType: PointerType) => {
    // restoreTextSelection();
    if (state.didMove) {
      onMoveEnd?.({
        type: "moveend",
        pointerType,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey,
      });
    }
  };

  const moveProps: Partial<MoveResult["moveProps"]> = {};

  const start = () => {
    // disableTextSelection();
    state.didMove = false;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerId === state.id) {
      const pointerType = (e.pointerType || "mouse") as PointerType;

      // Problems with PointerEvent#movementX/movementY:
      // 1. it is always 0 on macOS Safari.
      // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
      onMove(
        e,
        pointerType,
        e.pageX - (state.lastPosition?.pageX ?? 0),
        e.pageY - (state.lastPosition?.pageY ?? 0),
      );
      state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerId === state.id) {
      const pointerType = (e.pointerType || "mouse") as PointerType;
      end(e, pointerType);
      state.id = null;
      window.removeEventListener("pointermove", onPointerMove, false);
      window.removeEventListener("pointerup", onPointerUp, false);
      window.removeEventListener("pointercancel", onPointerUp, false);
    }
  };

  moveProps.onPointerDown = (e) => {
    if (e.button === 0 && state.id == null) {
      start();
      e.stopPropagation();
      e.preventDefault();
      state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
      state.id = e.pointerId;
      window.addEventListener("pointermove", onPointerMove, false);
      window.addEventListener("pointerup", onPointerUp, false);
      window.addEventListener("pointercancel", onPointerUp, false);
    }
  };

  const triggerKeyboardMove = (
    e: EventBase,
    deltaX: number,
    deltaY: number,
  ) => {
    start();
    onMove(e, "keyboard", deltaX, deltaY);
    end(e, "keyboard");
  };

  moveProps.onKeyDown = (e) => {
    switch (e.key) {
      case "Left":
      case "ArrowLeft":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, -1, 0);
        break;
      case "Right":
      case "ArrowRight":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 1, 0);
        break;
      case "Up":
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 0, -1);
        break;
      case "Down":
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 0, 1);
        break;
    }
  };

  return { moveProps: moveProps as MoveResult["moveProps"] };
}
