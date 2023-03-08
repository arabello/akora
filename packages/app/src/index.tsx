import { BentoProvider } from "@night-focus/design-system";
import { FocusScope } from "@react-aria/focus";
import ReactDOM from "react-dom/client";
import App from "./App";
import { defaultMessages } from "./defaultMessages";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <BentoProvider defaultMessages={defaultMessages}>
    <FocusScope>
      <App />
    </FocusScope>
  </BentoProvider>
);
