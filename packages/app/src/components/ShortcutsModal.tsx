import {
  Modal,
  Stack,
  Columns,
  Column,
  Inline,
  Chip,
  Body,
} from "@night-focus/design-system";

export const ShortcutsModal = (
  props: Omit<React.ComponentProps<typeof Modal>, "title" | "children">
) => (
  <Modal title="Shortcuts" {...props}>
    <Stack space={4}>
      {[
        {
          keybinding: "⌘ + K",
          desc: "Search throught the available sources.",
        },
        {
          keybinding: "⏎",
          desc: "Load the focused source into the tracks pool.",
        },
        {
          keybinding: "▲ ▼",
          desc: "Navigate tracks. If the search bar is focused, navigate sources.",
        },
        {
          keybinding: "◀ ▶",
          desc: "Control the focused track volume.",
        },
        {
          keybinding: "⇧ + ◀ ▶",
          desc: "Adjust the focused track volume precisely.",
        },
        {
          keybinding: "x",
          desc: "Remove the focused track from pool.",
        },
        {
          keybinding: "?",
          desc: "Toggle this dialog.",
        },
      ].map((a) => (
        <Columns space={16} key={a.keybinding}>
          <Column width="1/5">
            <Inline space={8}>
              <Chip label={a.keybinding} color="grey" />
            </Inline>
          </Column>
          <Column>
            <Body size="medium">{a.desc}</Body>
          </Column>
        </Columns>
      ))}
    </Stack>
  </Modal>
);
