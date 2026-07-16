// File largely copied from https://github.com/souporserious/reforest

import * as React from "react";

const IndexContext = React.createContext<string | null>(null);

/**
 * Parses a numerical dot-separated string as an index path.
 *
 * @example
 * parseIndexPath('0.10.2') -> [0, 10, 2]
 */
function parseIndexPath(indexPathString: string) {
  return indexPathString.split(".").map((index) => parseInt(index, 10));
}

/** Returns the index path data based on the closest useIndexedChildren. */
export function useIndex() {
  const indexPathString = React.useContext(IndexContext);

  return React.useMemo(() => {
    if (indexPathString === null) {
      throw new Error("Panels/PanelResizers must be used within a PanelGroup");
    }

    const indexPath = parseIndexPath(indexPathString);
    return { index: indexPath[indexPath.length - 1]! };
  }, [indexPathString]);
}

function flattenChildren(children: React.ReactNode[]): React.ReactNode[] {
  const flattenedChildren = children.flatMap((child) => {
    // For fragments we want to get rid of those so the children are flat
    if (React.isValidElement(child) && child.type === React.Fragment) {
      return flattenChildren(child.props.children);
    }

    return child;
  });

  return flattenedChildren.map((child, index) => {
    if (!React.isValidElement(child)) return child;

    // We then correct the keys for the order of the children
    // eslint-disable-next-line @eslint-react/no-clone-element
    return React.cloneElement(child, {
      // eslint-disable-next-line @eslint-react/no-array-index-key
      key: `.${index}`,
    });
  });
}

/** Provides the current index path for each child. */
export function useIndexedChildren(childrenProp: React.ReactNode) {
  const indexPathString = React.useContext(IndexContext);

  return (
    <>
      {/* eslint-disable-next-line @eslint-react/no-children-to-array */}
      {flattenChildren(React.Children.toArray(childrenProp)).map(
        (child, index) => {
          if (!React.isValidElement(child)) return child;
          return (
            <IndexContext.Provider
              key={child.key}
              value={
                indexPathString
                  ? `${indexPathString}.${index.toString()}`
                  : index.toString()
              }
            >
              {child}
            </IndexContext.Provider>
          );
        },
      )}
    </>
  );
}
