// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/global/toast/Toaster.jsx";
import { useToast } from "./hooks/useToast.js";


// Create a separate component so we can use the hook here
function Root() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <App />
      <Toaster toasts={toasts} removeToast={removeToast} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
