import { DesignSystemProvider } from "@buildo/bento-design-system";
import { defaultMessages } from "@buildo/bento-design-system/lib/defaultMessages/en";
import "@buildo/bento-design-system/index.css";
import "@buildo/bento-design-system/defaultTheme.css";
import { FocusScope } from "@react-aria/focus";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <DesignSystemProvider defaultMessages={defaultMessages}>
    <FocusScope>
      <App />
    </FocusScope>
  </DesignSystemProvider>
);
