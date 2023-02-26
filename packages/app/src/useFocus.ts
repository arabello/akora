import { useEffect, useState } from "react";

export const useFocus: <T>(
  items: Array<T>
) => [
  number | undefined,
  (actionOrIndex?: "next" | "prev" | number) => void
] = <T>(items: Array<T>) => {
  const [focus, setFocus] = useState<number>();
  useEffect(() => {
    focus !== undefined && focus >= items.length && setFocus(undefined);
  }, [items]);

  const move = (action: "next" | "prev") => {
    if (items.length == 0) {
      return setFocus(undefined);
    }

    switch (action) {
      case "next":
        return setFocus(
          focus === undefined || focus + 1 > items.length - 1 ? 0 : focus + 1
        );
      case "prev":
        return setFocus(
          focus === undefined || focus - 1 < 0 ? items.length - 1 : focus - 1
        );
    }
  };

  const externalSetFocus = (
    actionOrIndex?: "next" | "prev" | number | undefined
  ) => {
    switch (typeof actionOrIndex) {
      case "string":
        return move(actionOrIndex);
      case "number":
        if (
          actionOrIndex < 0 ||
          actionOrIndex > items.length ||
          items.length === 0
        ) {
          return setFocus(undefined);
        }
        return setFocus(actionOrIndex);
      default:
        return setFocus(undefined);
    }
  };

  return [focus, externalSetFocus];
};
