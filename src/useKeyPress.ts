import { useState, useEffect } from "react";

// https://usehooks.com/useKeyPress/
const useKeyPress = (listeningKeys: string[]) => {
  const [pressedKey, setPressedKey] = useState<string>();

  const downHandler = (event: KeyboardEvent) => {
    if (listeningKeys.includes(event.key)) {
      setPressedKey(event.key);
    }
  }

  const upHandler = () => {
    setPressedKey(undefined);
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  return pressedKey;
}

export default useKeyPress;
