import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CardStack({ items = [], className }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!Array.isArray(items) || items.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [items]);

  const activeItem = items[active] || null;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <AnimatePresence mode="wait">
        {activeItem ? (
          <motion.div
            key={activeItem.id ?? active}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-center bg-gray-50 p-4">
              <img
                src={activeItem.image}
                alt={activeItem.imageAlt || activeItem.title || "Service card image"}
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-900">{activeItem.title || activeItem.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{activeItem.description || activeItem.designation || ""}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
