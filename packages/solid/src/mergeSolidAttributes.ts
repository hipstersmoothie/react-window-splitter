/* eslint-disable @typescript-eslint/no-explicit-any */
import { mergeAttributes as mergeAttributesBase } from "@window-splitter/interface";

export type MaybeAccessor<T> = T | (() => T);

export function mergeSolidAttributes<T>(source: MaybeAccessor<T>): T;
export function mergeSolidAttributes<T, U>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
): T & U;
export function mergeSolidAttributes<T, U, V>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
): T & U & V;
export function mergeSolidAttributes<T, U, V, W>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
  source3: MaybeAccessor<W>,
): T & U & V & W;
export function mergeSolidAttributes(...sources: any[]) {
  const target = {};
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i];
    if (typeof source === "function") source = source();
    if (source) {
      const descriptors = Object.getOwnPropertyDescriptors(source);
      for (const key in descriptors) {
        if (key in target) continue;
        Object.defineProperty(target, key, {
          enumerable: true,
          get() {
            let e = {};
            if (
              key === "style" ||
              key === "class" ||
              key === "className" ||
              key.startsWith("on")
            ) {
              for (let j = 0; j < sources.length; j++) {
                let s = sources[j];
                if (typeof s === "function") s = s();
                e = mergeAttributesBase(e, { [key]: (s || {})[key] });
              }

              return (e as any)[key];
            }
            for (let j = sources.length - 1; j >= 0; j--) {
              let s = sources[j];
              if (typeof s === "function") s = s();
              const v = (s || {})[key];
              if (v !== undefined) return v;
            }
          },
        });
      }
    }
  }
  return target;
}
