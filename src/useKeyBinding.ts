import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useKeyPress from "./useKeyPress";

type KeyBinding<T> = {
  key: string;
  code: string;
  target: T;
};

type KeyBindings<T> = {
  byCode: {
    get: (code: string) => KeyBinding<T> | undefined;
    delete: (code: string) => void;
  };
  byTarget: {
    get: (target: T) => KeyBinding<T> | undefined;
    delete: (target: T) => void;
  };
};

const useKeyBindings: <T>() => [
  KeyBindings<T>,
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

  const ctrls: KeyBindings<T> = {
    byCode: {
      get: (code: string) => keyBindings.find((x) => x.code === code),
      delete: (code: string) =>
        setKeyBindings(keyBindings.filter((x) => x.code !== code)),
    },
    byTarget: {
      get: (target: T) => keyBindings.find((x) => x.target === target),
      delete: (target: T) =>
        setKeyBindings(keyBindings.filter((x) => x.target !== target)),
    },
  };

  return [ctrls, setTarget];
};

export default useKeyBindings;
