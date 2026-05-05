import { useEffect, useState } from "react";

const STEPS = [
  "Fetching Amazon listing data...",
  "Scraping 1,000+ competitor reviews...",
  "Running sentiment analysis...",
  "Estimating monthly revenues...",
  "Building your intelligence report...",
];

export default function Loading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <div className="flex flex-col gap-2 w-72">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-3 text-sm transition-all duration-300 ${
              i < step ? "text-green-400" : i === step ? "text-white" : "text-zinc-600"
            }`}
          >
            <span className="text-xs w-4 text-center">
              {i < step ? "✓" : i === step ? "→" : "·"}
            </span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}