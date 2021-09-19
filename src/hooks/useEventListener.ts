import { useEffect } from "react";

export const useEventListener = (
  event: string,
  handler: (event: any) => void,
  dependencies: any[] = []
) => {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => {
      window.removeEventListener(event, handler);
    };
  }, [event, handler, ...dependencies]);
};
