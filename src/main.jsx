// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/global/toast/Toaster.jsx";
import { useToast } from "./hooks/useToast.js";
import { Provider } from "react-redux";
import { persistor, store } from "./store/index.jsx";
import PermissionInitializer from "./components/permission/PermissionInitializer.jsx";
import { PersistGate } from "redux-persist/integration/react";

// Create a separate component so we can use the hook here
function Root() {
  const { toasts, removeToast } = useToast();

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
          </div>
        }
        persistor={persistor}
      >
        <PermissionInitializer>
          <App />
          <Toaster toasts={toasts} removeToast={removeToast} />
        </PermissionInitializer>
      </PersistGate>
    </Provider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
