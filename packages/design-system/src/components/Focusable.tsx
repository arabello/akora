import { forwardRef } from "react"
import { ReactElement } from "react"

type Props = {
  id?: string,
  children: ReactElement
}

/**
 * Container propagating its focus to its child.
 * 
 * Helpful for wrapping components having no focus APIs.
 */
export const Focusable = forwardRef<HTMLDivElement, Props>(
  (props, ref) => (
    <div
      id={props.id}
      tabIndex={0}
      ref={ref}
      onFocus={e =>
        (e.target.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement | null
        )?.focus()}>
      {props.children}
    </div>
  ))
