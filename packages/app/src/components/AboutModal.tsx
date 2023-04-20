import { Modal, Stack, Body, Link } from "@night-focus/design-system";

export const AboutModal = (
  props: Omit<React.ComponentProps<typeof Modal>, "title" | "children">
) => (
  <Modal title="About" {...props}>
    <Stack space={24}>
      <Body size="large">
        I built Night Focus mostly for my evening sessions.
      </Body>
      <Body size="large">
        I love to{" "}
        <Body size="large" weight="strong">
          immerse
        </Body>{" "}
        myself with ambient sounds while studying, coding and reading. I wanted
        something{" "}
        <Body size="large" weight="strong">
          tailored
        </Body>{" "}
        to my picky user experience that I can fine tune at need. Differently
        from background music, it hugs my mind just enough to{" "}
        <Body size="large" weight="strong">
          focus
        </Body>{" "}
        with no intrusive distracting peaks.
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
