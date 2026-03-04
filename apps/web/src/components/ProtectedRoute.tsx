import type { ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-4 text-neutral-300">Laster…</div>;
  }

  if (!isAuthenticated) {
    const returnTo = location.pathname + location.search;

    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Workout Tracker 💪</h1>
          <p className="text-neutral-300">Logg inn for å bruke appen.</p>

          <button
            onClick={() => {
              sessionStorage.setItem("wt.returnTo", returnTo);

              loginWithRedirect({
                appState: { returnTo },
                authorizationParams: {
                  redirect_uri: `${window.location.origin}/callback`,
                },
              });
            }}
            className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold"
          >
            Logg inn
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}