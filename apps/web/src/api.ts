export async function fetchMe(getAccessTokenSilently: () => Promise<string>) {
  const token = await getAccessTokenSilently();

  const res = await fetch("http://localhost:5229/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function createWorkout(
  getAccessTokenSilently: () => Promise<string>,
  title: string
) {
  const token = await getAccessTokenSilently();

  const res = await fetch("http://localhost:5229/workouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}