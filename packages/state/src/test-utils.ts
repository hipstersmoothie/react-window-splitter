import {
  groupMachine,
  GroupMachineContextValue,
  SendFn,
  State,
} from "./index.js";

export interface Actor {
  send: SendFn;
  value: GroupMachineContextValue;
  state: { current: State };
}

export function createActor(
  input: Partial<GroupMachineContextValue>,
  onChange?: (context: GroupMachineContextValue) => void,
  getGroupElement?: () => HTMLElement | null
): Actor {
  const [context, send, state] = groupMachine(
    input,
    onChange,
    getGroupElement
  );

  return {
    send,
    value: context,
    state,
  };
}
