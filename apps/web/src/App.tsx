import { useAuth0 } from "@auth0/auth0-react";
import { fetchMe } from "./api";
import { createWorkout } from "./api";
import { useState } from "react";


function App() {
  const [meData, setMeData] = useState<any>(null);

  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const callApi = async () => {
    try {
      const data = await fetchMe(getAccessTokenSilently);
      setMeData(data);
    } catch (err) {
      console.error("Call API error:", err);
      alert("Noe feilet. Sjekk console.");
    }
  };

  const handleCreateWorkout = async () => {
  try {
    const workout = await createWorkout(
      getAccessTokenSilently,
      "Brystøkt 💪"
    );

    console.log("Workout opprettet:", workout);
    alert("Workout lagret!");
  } catch (err) {
    console.error(err);
    alert("Feilet å lagre workout");
  }
};

  if (isLoading) return <div className="p-4">Laster...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex justify-center">
      <div className="w-full max-w-md p-6 space-y-6">
        <h1 className="text-2xl font-bold">Workout Tracker 💪</h1>

        {!isAuthenticated ? (
          <button
            onClick={() => loginWithRedirect()}
            className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold"
          >
            Logg inn
          </button>
        ) : (
          <>
            <div className="rounded-2xl bg-neutral-900 p-4">
              <div className="text-sm text-neutral-400">Innlogget som</div>
              <div className="font-semibold">{user?.email ?? user?.name}</div>
                {user?.name && user?.email && user.name !== user.email && (
                  <div className="text-sm text-neutral-400">{user.name}</div>
                )}
            </div>

            <button
              onClick={callApi}
              className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold"
            >
              Test API (/me)
            </button>

            {meData && (
              <pre className="bg-neutral-900 p-4 rounded-2xl text-xs overflow-auto max-h-64">
                {JSON.stringify(meData, null, 2)}
              </pre>
            )}

            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold"
            >
              Logg ut
            </button>

              <button
    onClick={handleCreateWorkout}
    className="w-full rounded-2xl bg-green-600 py-4 text-lg font-semibold"
  >
    Lag test-workout
  </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;