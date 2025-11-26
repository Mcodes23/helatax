import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// Import Contexts
import { FilingProvider } from "./context/FilingContext";
import { AuthProvider } from "./context/AuthContext"; // <--- NEW IMPORT

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* <--- Wrap Outer Layer */}
      <FilingProvider>
        {" "}
        {/* <--- Wrap Inner Layer */}
        <App />
      </FilingProvider>
    </AuthProvider>
  </React.StrictMode>
);
