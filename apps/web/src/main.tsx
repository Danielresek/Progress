import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./index.css";

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE as string;

function Auth0ProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: `${window.location.origin}/callback`,
        audience: auth0Audience,
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