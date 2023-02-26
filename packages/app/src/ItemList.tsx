type Props = {
  items: Array<{ id: string; label: string }>;
  isClickable?: (item: { id: string; label: string }) => boolean;
  onClick?: (item: { id: string; label: string }) => void;
  isFocused?: (item: { id: string; label: string }, index: number) => boolean;
};

export const ItemList = (props: Props) => (
  <ul>
    {props.items.map((item, index) => (
      <li
        key={item.id}
        style={
          props.isFocused && props.isFocused(item, index)
            ? { background: "lightgray" }
            : {}
        }
      >
        {props.isClickable && props.isClickable(item) ? (
          <a href="#" onClick={() => props.onClick && props.onClick(item)}>
            {item.label}
          </a>
        ) : (
          <span>{item.label}</span>
        )}
      </li>
    ))}
  </ul>
);
