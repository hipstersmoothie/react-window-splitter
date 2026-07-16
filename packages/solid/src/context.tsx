import { createContext, useContext, Accessor, JSXElement } from "solid-js";
import { GroupMachineContextValue, SendFn } from "@window-splitter/state";

export const InitialPrerenderContext = createContext<Accessor<boolean>>(
  () => false,
);
export const MachineActorContext = createContext<SendFn>();
export const GroupIdContext = createContext<string>();
export const MachineStateContext =
  createContext<Accessor<GroupMachineContextValue | undefined>>();

export function useInitialPrerenderContext() {
  const context = useContext(InitialPrerenderContext);
  return context;
}

export function useMachineActor() {
  const context = useContext(MachineActorContext);
  return context;
}

export function useGroupId() {
  const context = useContext(GroupIdContext);
  return context;
}

export function useMachineState() {
  const context = useContext(MachineStateContext);
  return context;
}

// Create a provider component that bundles all the contexts together
export function GroupMachineProvider(props: {
  children: JSXElement;
  groupId: string;
  send: SendFn;
  state: Accessor<GroupMachineContextValue | undefined>;
  initialPrerender?: Accessor<boolean>;
}) {
  return (
    <InitialPrerenderContext.Provider
      value={props.initialPrerender ?? (() => false)}
    >
      {/* The rule is wrong. the docs even suggust this pattern */}
      {/* eslint-disable-next-line solid/reactivity */}
      <GroupIdContext.Provider value={props.groupId}>
        {/* eslint-disable-next-line solid/reactivity */}
        <MachineActorContext.Provider value={props.send}>
          {/* eslint-disable-next-line solid/reactivity */}
          <MachineStateContext.Provider value={props.state}>
            {props.children}
          </MachineStateContext.Provider>
        </MachineActorContext.Provider>
      </GroupIdContext.Provider>
    </InitialPrerenderContext.Provider>
  );
}
