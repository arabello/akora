import { Modal, Stack, Body, Link } from "@buildo/bento-design-system";
import { Buffer } from "buffer";

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
        <Link
          href={`mailto:${Buffer.from(
            "bWF0dGVvLnBlbGxlLnBlbGxlZ3Jpbm9AZ21haWwuY29t",
            "base64"
          )}?subject=%5BNight%20Focus%5D`}
        >
          reach out to me
        </Link>{" "}
        for any feedback, requests or suggestions.
      </Body>

      <Body size="large">
        To report an unexpected behavior, please open an issue on{" "}
        <Link href="https://github.com/arabello/night-focus/issues">
          GitHub
        </Link>
        .
      </Body>
    </Stack>
  </Modal>
);
