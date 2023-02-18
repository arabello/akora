import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type KeyBinding<T> = {
  key: string;
  code: string;
  target: T;
};

// https://usehooks.com/useKeyPress/
// https://keyjs.dev/
export const useKeyPress = () => {
  const [event, setEvent] = useState<KeyboardEvent>();

  const downHandler = (e: KeyboardEvent) => setEvent(e);
  const upHandler = () => setEvent(undefined);

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  return event;
};

export const useKeyBinding: <T>() => [
  Array<KeyBinding<T>>,
  Dispatch<SetStateAction<Array<KeyBinding<T>>>>,
  Dispatch<SetStateAction<T | undefined>>
] = <T>() => {
  const pressKeyEvent = useKeyPress();
  const [target, setTarget] = useState<T>();
  const [keyBindings, setKeyBindings] = useState<Array<KeyBinding<T>>>([]);

  const put = (key: string, code: string, target: T) =>
    setKeyBindings(
      keyBindings
        .filter((x) => x.code !== code)
        .filter((x) => x.target !== target)
        .concat({
          key,
          code,
          target,
        })
    );

  useEffect(() => {
    if (target && pressKeyEvent) {
      put(pressKeyEvent.key, pressKeyEvent.code, target);
      setTarget(undefined);
    }
  }, [pressKeyEvent]);

  return [keyBindings, setKeyBindings, setTarget];
};

export const useFocus: <T>(
  items: Array<T>
) => [
  number | undefined,
  (actionOrIndex?: "next" | "prev" | number) => void
] = <T>(items: Array<T>) => {
  const [focus, setFocus] = useState<number>();

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
          return;
        }
        return setFocus(actionOrIndex);
      default:
        return setFocus(undefined);
    }
  };

  return [focus, externalSetFocus];
};
