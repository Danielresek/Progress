import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="mx-auto w-full max-w-md px-4 pt-6 pb-28">
        {children}
      </main>
    </div>
  );
}