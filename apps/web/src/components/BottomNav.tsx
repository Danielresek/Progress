import { NavLink } from "react-router-dom";

const linkBase =
  "flex-1 py-3 text-sm font-semibold text-center rounded-2xl transition";
const linkInactive = "text-neutral-300";
const linkActive = "bg-neutral-800 text-white";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0">
      <div className="mx-auto w-full max-w-md px-4 pb-4">
        <div className="rounded-3xl bg-neutral-900/90 backdrop-blur border border-neutral-800 p-2 flex gap-2">
          <NavLink
            to="/today"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Today
          </NavLink>

          <NavLink
            to="/plan"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Plan
          </NavLink>

          <NavLink
            to="/progress"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Progress
          </NavLink>
        </div>
      </div>
    </nav>
  );
}