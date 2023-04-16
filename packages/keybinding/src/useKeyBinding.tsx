import { useEffect } from "react";
import { Actions, keyBindingFrom, match } from "./keybinding";
import { useKeyPress } from "./useKeyPress";

export const useKeyBinding: <R>(initActions: Actions<R>) => void = <R,>(
  initActions: Actions<R>
) => {
  const keyPress = useKeyPress();

  useEffect(() => {
    if (!keyPress) {
      return;
    }

    const keyBinding = keyBindingFrom(keyPress);

    if (!keyBinding) {
      return;
    }

    initActions[keyBinding.id] && keyPress.preventDefault();
    match(initActions)(keyBinding);
  }, [keyPress]);

  return;
};
