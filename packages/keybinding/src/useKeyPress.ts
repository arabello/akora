import { useEffect, useState } from "react";

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
