import { SnakeGame } from "@/components/snake-game";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-cyan-300/80">
            Arcade
          </p>
          <h1 className="bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            Neon Snake
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Eat, grow, beat your high score. Everything runs in the browser.
          </p>
        </header>

        <SnakeGame />

        <footer className="mt-10 text-center text-xs text-slate-500">
          Built with Next.js · High score saved in{" "}
          <span className="text-slate-400">localStorage</span>
        </footer>
      </div>
    </main>
  );
}
