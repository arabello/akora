import { Body, Stack } from "@night-focus/design-system";

type Props = {
  items: Array<{ id: string; label: string }>;
  isClickable?: (item: { id: string; label: string }) => boolean;
  onClick?: (item: { id: string; label: string }) => void;
  isFocused?: (item: { id: string; label: string }, index: number) => boolean;
};

export const ItemList = (props: Props) => (
  <Stack space={4}>
    {props.items.map((item, index) => (
      <div
        key={item.id}
        style={
          props.isFocused && props.isFocused(item, index)
            ? { background: "lightgray" }
            : {}
        }
      >
        {props.isClickable && props.isClickable(item) ? (
          <a
            href="#"
            onClick={() => props.onClick && props.onClick(item)}
            data-focus-id={`source-${index}`}
          >
            <Body size="small">{item.label}</Body>
          </a>
        ) : (
          <Body size="small">{item.label}</Body>
        )}
      </div>
    ))}
  </Stack>
);
