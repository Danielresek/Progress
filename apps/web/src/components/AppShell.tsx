import type { ReactNode } from "react";
import logo from "../assets/logo.svg";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      {/* Top header */}
      <header className="pt-7 pb-3">
        <img
          src={logo}
          alt="Progress"
          className="h-20 w-auto mx-auto select-none"
        />
      </header>

      {/* content */}
      <main className="mx-auto w-full max-w-md px-4 pb-28">{children}</main>
    </div>
  );
}