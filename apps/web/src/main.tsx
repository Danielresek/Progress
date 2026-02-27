import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-p2xu7qni4a01fbfr.us.auth0.com"
      clientId="xmXKKh7Q8iwk3eFsJ5tcvhk1XZ0y9j0v"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://workouttracker-api",
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
);