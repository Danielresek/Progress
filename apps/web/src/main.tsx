import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./index.css";

function Auth0ProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain="dev-p2xu7qni4a01fbfr.us.auth0.com"
      clientId="xmXKKh7Q8iwk3eFsJ5tcvhk1XZ0y9j0v"
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: `${window.location.origin}/callback`,
        audience: "https://workouttracker-api",
      }}
      onRedirectCallback={(appState) => {
        const stored = sessionStorage.getItem("wt.returnTo");
        const target = appState?.returnTo ?? stored ?? "/today";

        sessionStorage.removeItem("wt.returnTo");
        navigate(target, { replace: true });
      }}
    >
      {children}
    </Auth0Provider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <App />
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>
);