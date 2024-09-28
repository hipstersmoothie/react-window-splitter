import { cookies } from "next/headers";
import { PersistanceExampleVisual } from "../../../../examples/PersistanceExampleVisual";

export default async function Persistance() {
  const allCookies = await cookies();
  const persistedState = allCookies.get("autosave");
  const snapshot = persistedState
    ? JSON.parse(persistedState.value)
    : undefined;

  return <PersistanceExampleVisual snapshot={snapshot} />;
}
