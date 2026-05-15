import { DinoGame } from "@/components/DinoGame";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-amber-50/90 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="mb-8 text-center">
        <h1 className="font-mono text-3xl font-bold tracking-tight text-zinc-900 dark:text-amber-100 sm:text-4xl">
          The Dinosaur Game
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Side-scrolling desert runner — jump the rocks and cacti, grab coins, and chase your high score.
        </p>
      </header>
      <DinoGame />
    </div>
  );
}
