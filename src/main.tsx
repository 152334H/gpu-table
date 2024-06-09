import { render } from "preact";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

render(
  <TooltipProvider>
    <App />
  </TooltipProvider>,
  document.getElementById("root")!,
);
