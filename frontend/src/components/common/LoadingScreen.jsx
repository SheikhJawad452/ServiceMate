import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";

export default function LoadingScreen({ ready = false }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(85), 50);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const timer = window.setTimeout(() => setProgress(100), 30);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return (
    <div
      className={`h-screen w-full bg-white flex items-center justify-center opacity-0 ${
        ready ? "animate-[fadeOut_0.35s_ease-out_forwards]" : "animate-[fadeIn_0.3s_ease-out_forwards]"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <img
          src={logo}
          alt="ServiceMate"
          className="h-9 w-auto object-contain opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]"
          draggable={false}
        />
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`relative h-full rounded-full bg-[#1E3A8A] ${ready ? "transition-all duration-300 ease-in-out" : "transition-all duration-[1200ms] ease-out"}`}
            style={{ width: `${progress}%` }}
          >
            <span className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-[shine_2.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
