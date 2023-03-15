import { Body, TextField } from "@buildo/bento-design-system";

type Props = Omit<React.ComponentProps<typeof TextField>, "label">;

export const SearchBar = (props: Props) => (
  <TextField
    {...props}
    label=""
    hint=""
    rightAccessory={
      <Body size="medium" color="secondary">
        ⌘ + K
      </Body>
    }
  />
);
