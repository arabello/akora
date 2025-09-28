import { useFocusManager, FocusManagerOptions as FMO } from "@react-aria/focus";
import { FocusableElement } from "@react-types/shared";
import { useState } from "react";

export interface FocusManagerOptions extends FMO {
  find?: (focusId: string) => boolean;
}

export interface FocusManager {
  focusNext(opts?: FocusManagerOptions): FocusableElement;
  focusPrevious(opts?: FocusManagerOptions): FocusableElement;
  focusFirst(opts?: FocusManagerOptions): FocusableElement;
  focusLast(opts?: FocusManagerOptions): FocusableElement;
  focusClear(): void;
  currentFocusId?: string;
}

/**
 * @param dataAttrName A valid [data-*](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*) attribute used to specify focus ids. Default is 'data-focus-id'.
 * @returns
 */
export const useFocus: (dataAttrName?: string) => FocusManager = (
  dataAttrName = "data-focus-id",
) => {
  const overrideAccept: (
    f: (focusId: string) => boolean,
  ) => (n: Element) => boolean = (f) => (n) => {
    const attr = n.getAttribute(dataAttrName);
    return attr ? f(attr) : false;
  };

  const overrideOpts = (opts?: FocusManagerOptions) =>
    opts && opts.find
      ? {
          ...opts,
          accept: overrideAccept(opts.find),
        }
      : opts;

  const [currentFocusId, setCurrentFocusId] = useState<string>();
  const overrideFn =
    (fn: (opts?: FocusManagerOptions) => FocusableElement) =>
    (opts?: FocusManagerOptions) => {
      const elem = fn(overrideOpts(opts));
      if (!elem) {
        return elem;
      }
      const focusId = elem.getAttribute(dataAttrName);
      focusId && setCurrentFocusId(focusId);
      return elem;
    };

  const manager = useFocusManager();

  return {
    currentFocusId,
    focusFirst: overrideFn(manager.focusFirst),
    focusNext: overrideFn(manager.focusNext),
    focusPrevious: overrideFn(manager.focusPrevious),
    focusLast: overrideFn(manager.focusLast),
    focusClear: () => {
      (document.activeElement as HTMLElement).blur();
      setCurrentFocusId(undefined);
    },
  };
};
