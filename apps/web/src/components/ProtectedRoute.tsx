import type { ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
        <div className="text-neutral-300">Laster…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = location.pathname + location.search;

    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <img
            src={logo}
            alt="Progress"
            className="h-24 w-auto mx-auto opacity-95 select-none"
          />

          <div className="mt-10 space-y-4">
            <h1 className="text-1xl font-bold">Take your workout to the next level</h1>
            <p className="text-neutral-300">Log in to track your progress</p>

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
              className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}