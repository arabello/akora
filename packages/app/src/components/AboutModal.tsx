import { Modal, Stack, Body, Link } from "@buildo/bento-design-system";

export const AboutModal = (
  props: Omit<React.ComponentProps<typeof Modal>, "title" | "children">
) => (
  <Modal title="About" {...props}>
    <Stack space={24}>
      <Body size="large">
        I love to{" "}
        <Body size="large" weight="strong">
          immerse
        </Body>{" "}
        myself with ambient sounds while studying, coding or reading. I wanted
        something{" "}
        <Body size="large" weight="strong">
          tailored
        </Body>
        , with a picky user experience to mix and fine-tune a variety of ambient
        sounds. I sought a customizable auditory experience that would reconcile
        my{" "}
        <Body size="large" weight="strong">
          focus
        </Body>{" "}
        .
      </Body>
      <Body size="large">
        Feel free to{" "}
        <Link href="mailto:matteo.pelle.pellegrino@gmail.com?subject=%5BNight%20Focus%5D">
          reach out to me
        </Link>{" "}
        for any feedback, requests or suggestions.
      </Body>
    </Stack>
  </Modal>
);
