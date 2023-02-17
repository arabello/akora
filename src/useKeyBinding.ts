import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { KeyBinding } from "./model";
import useKeyPress from "./useKeyPress";

const useKeyBindings: <T>() => [
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

export default useKeyBindings;
