type Props = {
  onReset: () => void;
};

export default function Navbar({ onReset }: Props) {
  return (
    <nav className="px-8 py-4 border-b border-zinc-800 flex items-center justify-between">
      
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-sm">🚀</div>
        <span className="font-bold text-base tracking-tight">ReviewIQ</span>
        <span className="ml-2 bg-zinc-800 text-zinc-400 text-[11px] px-2 py-0.5 rounded-full">
          BETA
        </span>
      </div>

      {/* Right side */}
      <button
        onClick={onReset}
        className="text-sm text-zinc-400 hover:text-white transition"
      >
        Analyze Another
      </button>

    </nav>
  );
}