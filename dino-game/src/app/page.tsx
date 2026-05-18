import { DinoGame } from "@/components/DinoGame";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <header className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-300 bg-clip-text font-mono text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          The Dinosaur Game
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Side-scrolling desert runner — jump the rocks and cacti, grab coins, and chase your high score.
        </p>
      </header>
      <DinoGame />
    </div>
  );
}
