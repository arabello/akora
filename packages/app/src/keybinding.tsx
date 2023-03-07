// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values#code_values_on_mac
const codes = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyH', 'KeyG', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'IntlBackslash', 'KeyB', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyY', 'KeyT', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit6', 'Digit5', 'Equal', 'Digit9', 'Digit7', 'Minus', 'Digit8', 'Digit0', 'BracketRight', 'KeyO', 'KeyU', 'BracketLeft', 'KeyI', 'KeyP', 'Enter', 'KeyL', 'KeyJ', 'Quote', 'KeyK', 'Semicolon', 'Backslash', 'Comma', 'Slash', 'KeyN', 'KeyM', 'Period', 'Tab', 'Space', 'Backquote', 'Backspace', 'Escape', 'MetaRight', 'MetaLeft', 'ShiftLeft', 'CapsLock', 'AltLeft', 'ControlLeft', 'ShiftRight', 'AltRight', 'ControlRight', 'F17', 'NumpadDecimal', 'NumpadMultiply', 'NumpadAdd', 'NumLock', 'AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute', 'NumpadDivide', 'NumpadEnter', 'NumpadSubtract', 'F18', 'F19', 'NumpadEqual', 'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Num'] as const;
type Code = typeof codes[number];
type CodeBinding = {
  code: Code
}

const isCodeBinding = (obj: any): obj is CodeBinding =>
  codes.includes((obj as CodeBinding).code)

const modifierKeys = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const
type ModifierKey = typeof modifierKeys[number];
type ModifierBinding = {
  [K in ModifierKey]: boolean
}

const isModifierBinding = (obj: any): obj is ModifierBinding =>
  modifierKeys.every(k => typeof obj[k] === 'boolean')

type KeyBindingData = CodeBinding & ModifierBinding;
type KeyBindingId = string

export type KeyBinding = CodeBinding & ModifierBinding & {
  id: KeyBindingId
  is: (target: KeyBinding) => boolean
}

export const isKeyBinding = (obj: any): obj is KeyBinding =>
  isCodeBinding(obj) &&
  isModifierBinding(obj) &&
  typeof (obj as KeyBinding).is === 'function' &&
  typeof (obj as KeyBinding).id === 'function'

const compare = (
  a: Pick<KeyBinding, keyof CodeBinding | ModifierKey>,
  b: Pick<KeyBinding, keyof CodeBinding | ModifierKey>
) =>
  (a.code === b.code) &&
  (a.altKey === b.altKey) &&
  (a.ctrlKey === b.ctrlKey) &&
  (a.metaKey === b.metaKey) &&
  (a.shiftKey === b.shiftKey)

const makeModifierBinding: (modifiers?: Partial<ModifierBinding>) => ModifierBinding =
  (m) => Object.assign({}, ...modifierKeys.map(
    m == undefined ?
      k => ({ [k]: false }) :
      k => ({ [k]: m[k] === undefined ? false : m[k] }
      )));

const makeKeyBindingData: (code: Code, modifiers?: Partial<ModifierBinding>) => KeyBindingData =
  (code, m) => ({
    code,
    ...makeModifierBinding(m),
  })

const makeKeyBinding: (code: Code, modifiers?: Partial<ModifierBinding>) => KeyBinding =
  (code, modifiers) => {
    const kbd = makeKeyBindingData(code, modifiers)
    return ({
      ...kbd,
      id: `${code}${modifierKeys.map(m => kbd[m] ? `-${m}` : '')}`,
      is: (t) => isCodeBinding(t) && isModifierBinding(t) && compare(kbd, t)
    })
  }

type FromKeyboarEvent = ModifierBinding & {
  code: string,
}

export const keyBindingFrom: (input: FromKeyboarEvent) => KeyBinding | undefined =
  i => isCodeBinding(i) && isModifierBinding(i) ?
    makeKeyBinding(i.code, i) :
    undefined

const codesNames = ['A', 'S', 'D', 'F', 'H', 'G', 'Z', 'X', 'C', 'V', 'IntlBackslash', 'B', 'Q', 'W', 'E', 'R', 'Y', 'T', '1', '2', '3', '4', '6', '5', 'Equal', '9', '7', 'Minus', '8', '0', 'BracketRight', 'O', 'U', 'BracketLeft', 'I', 'P', 'Enter', 'L', 'J', 'Quote', 'K', 'Semicolon', 'Backslash', 'Comma', 'Slash', 'N', 'M', 'Period', 'Tab', 'Space', 'Backquote', 'Backspace', 'Escape', 'MetaRight', 'MetaLeft', 'ShiftLeft', 'CapsLock', 'AltLeft', 'ControlLeft', 'ShiftRight', 'AltRight', 'ControlRight', 'F17', 'NumpadDecimal', 'NumpadMultiply', 'NumpadAdd', 'NumLock', 'AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute', 'NumpadDivide', 'NumpadEnter', 'NumpadSubtract', 'F18', 'F19', 'NumpadEqual', 'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Num'] as const;
type Keys = { [C in typeof codesNames[number]]: KeyBinding }
export const keys: Keys = Object.assign({}, ...codes.map(
  code => ({ [code.replace('Key', '').replace('Digit', '')]: makeKeyBinding(code) })
))

export const meta: Keys = keys

export const command = meta;
export const window = meta;

type CodeMatch<R> = Record<KeyBindingId, () => R | void>

const defaultMatch: CodeMatch<void> = Object.assign({}, ...codes.map(c => ({ [c]: () => { } })))
export const match: <R>(match: Partial<CodeMatch<R>>) => (target: KeyBinding) => R | void = m => t =>
  Object.assign(defaultMatch, m)[t.code]();

export const Focusable = (props: { id: string, children: JSX.Element }) => (
  <div
    id={props.id}
    tabIndex={0}
    onFocus={e =>
      (e.target.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement | null
      )?.focus()}>
    {props.children}
  </div>
)
