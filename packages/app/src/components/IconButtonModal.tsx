import { IconButton, Modal } from "@night-focus/design-system"
import { useState } from "react"

type Props = Omit<React.ComponentProps<typeof IconButton>, "label" | "onPress"> & {
  children: JSX.Element
  title: React.ComponentProps<typeof Modal>["title"]
}

export const IconButtonModal = (props: Props) => {
  const [show, setShow] = useState(false)

  return (
    <>
      <IconButton
        {...props}
        label=""
        onPress={() => setShow(!show)}
      />
      {show && <Modal
        title={props.title}
        onClose={() => setShow(false)}>
        {props.children}
      </Modal>
      }
    </>
  )
}
