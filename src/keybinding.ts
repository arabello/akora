import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { KeyBinding } from "./model";

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
  T | undefined,
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
    if (
      target &&
      pressKeyEvent &&
      !pressKeyEvent.metaKey &&
      !pressKeyEvent.ctrlKey &&
      !pressKeyEvent.altKey &&
      !pressKeyEvent.shiftKey
    ) {
      put(pressKeyEvent.key, pressKeyEvent.code, target);
      setTarget(undefined);
    }
  }, [pressKeyEvent]);

  return [keyBindings, setKeyBindings, target, setTarget];
};
