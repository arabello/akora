import { codes, codesNames } from "./consts";

// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values#code_values_on_mac
type Code = (typeof codes)[number];
type CodeBinding = {
  code: Code;
};

const isCodeBinding = (obj: any): obj is CodeBinding =>
  codes.includes((obj as CodeBinding).code);

const modifierKeys = ["altKey", "ctrlKey", "metaKey", "shiftKey"] as const;
type ModifierKey = (typeof modifierKeys)[number];
type ModifierBinding = {
  [K in ModifierKey]: boolean;
};

const isModifierBinding = (obj: any): obj is ModifierBinding =>
  modifierKeys.every((k) => typeof obj[k] === "boolean");

type KeyBindingData = CodeBinding & ModifierBinding;
type KeyBindingId = string;

export type KeyBinding = CodeBinding &
  ModifierBinding & {
    id: KeyBindingId;
  };

export const isKeyBinding = (obj: any): obj is KeyBinding =>
  isCodeBinding(obj) &&
  isModifierBinding(obj) &&
  typeof (obj as KeyBinding).id === "string";

const makeModifierBinding: (
  modifiers?: Partial<ModifierBinding>
) => ModifierBinding = (m) =>
  Object.assign(
    {},
    ...modifierKeys.map(
      m == undefined
        ? (k) => ({ [k]: false })
        : (k) => ({ [k]: m[k] === undefined ? false : m[k] })
    )
  );

const makeKeyBindingData: (
  code: Code,
  modifiers?: Partial<ModifierBinding>
) => KeyBindingData = (code, m) => ({
  code,
  ...makeModifierBinding(m),
});

const makeKeyBinding: (
  code: Code,
  modifiers?: Partial<ModifierBinding>
) => KeyBinding = (code, modifiers) => {
  const kbd = makeKeyBindingData(code, modifiers);
  return {
    ...kbd,
    id: [code, ...modifierKeys.filter((m) => kbd[m])].join("-"),
  };
};

type FromKeyboarEvent = ModifierBinding & {
  code: string;
};

export const keyBindingFrom: (
  input: FromKeyboarEvent
) => KeyBinding | undefined = (i) =>
  isCodeBinding(i) && isModifierBinding(i)
    ? makeKeyBinding(i.code, i)
    : undefined;

type ExportedKeyBindingsSimple = {
  [C in (typeof codesNames)[number]]: KeyBinding;
};

const makeExportedKeyBindings: (
  modifiers?: Partial<ModifierBinding>
) => ExportedKeyBindingsSimple = (m) =>
  Object.assign(
    {},
    ...codes.map((code) => ({
      [code.replace("Key", "").replace("Digit", "")]: makeKeyBinding(code, m),
    }))
  );

const exportedKeyBindingsKeys: ExportedKeyBindingsSimple =
  makeExportedKeyBindings();
const simplerModifiers = ["alt", "ctrl", "meta", "shift"] as const;
type SimplerModifier = (typeof simplerModifiers)[number];

type Composable<T extends SimplerModifier> = {
  [K in T]: ExportedKeyBindingsSimple & Composable<Exclude<T, K>>;
};

// I can't read it either
const f: <T extends SimplerModifier>(
  modifiers: Array<SimplerModifier>
) => Composable<T> = (m) =>
  m.length === 1
    ? Object.assign(
        {},
        makeExportedKeyBindings(),
        ...m.map((x) => ({
          [x]: makeExportedKeyBindings({ [`${x}Key`]: true }),
        }))
      )
    : Object.assign(
        {},
        makeExportedKeyBindings(
          Object.assign(
            {},
            ...simplerModifiers
              .filter((s) => !m.includes(s))
              .map((x) => ({ [`${x}Key`]: true }))
          )
        ),
        ...m.map((x) => ({
          [x]: f(m.filter((y) => y != x)),
        }))
      );

type ExportedKeyBindings = Composable<SimplerModifier>;
export const KB: ExportedKeyBindingsSimple & ExportedKeyBindings = {
  ...exportedKeyBindingsKeys,
  ...f(Array.from(simplerModifiers)),
};

type CodeMatch<R> = Record<KeyBindingId, () => R | void>;

export const match: <R>(
  match: Partial<CodeMatch<R>>
) => (target: KeyBinding) => R | void = (m) => (t) => {
  const f = m[t.id];
  if (typeof f === "function") {
    return f();
  }
};
