import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import type { PropsWithChildren } from "react";

export default function Auth0ProviderWithNavigate({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain="dev-p2xu7qni4a01fbfr.us.auth0.com"
      clientId="xmXKKh7Q8iwk3eFsJ5tcvhk1XZ0y9j0v"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://workouttracker-api",
      }}
      onRedirectCallback={(appState) => {
        const target = appState?.returnTo || "/today";
        navigate(target, { replace: true });
      }}
    >
      {children}
    </Auth0Provider>
  );
}