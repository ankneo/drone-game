import DroneGame from '@/components/DroneGame';

export default function Home() {
  return (
    <main className="h-svh bg-slate-950 text-slate-50 flex flex-col items-center justify-start md:justify-center p-2 md:p-6 overflow-hidden">
      <div className="w-full max-w-[1400px] flex flex-col items-center justify-start md:justify-center space-y-1 md:space-y-4 h-full">
        <div className="text-center md:mb-0 mt-2 md:mt-0">
          <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic">
            DRONE PILOT
          </h1>
        </div>
        <DroneGame />
        <div className="text-center text-[10px] md:text-xs text-slate-500 hidden md:block uppercase tracking-[0.2em] opacity-50">
          Control: [Arrows] or [WASD] • Action: [Space]
        </div>
      </div>
    </main>
  );
}
