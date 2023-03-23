import { TextField } from "@buildo/bento-design-system";

type Props = Omit<React.ComponentProps<typeof TextField>, "label">;

export const SearchBar = (props: Props) => (
  <TextField {...props} label="" hint="" />
);
