import DroneGame from '@/components/DroneGame';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Drone Pilot
          </h1>
          <p className="text-slate-400">Navigate the gauntlet. Soft landings only.</p>
        </div>
        <DroneGame />
        <div className="text-center text-sm text-slate-500">
          Use <kbd className="bg-slate-800 px-2 py-1 rounded">Arrow Keys</kbd> or <kbd className="bg-slate-800 px-2 py-1 rounded">WASD</kbd> to fly.
        </div>
      </div>
    </main>
  );
}
