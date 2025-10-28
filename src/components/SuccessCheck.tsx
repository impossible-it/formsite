import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoUrl from "./image/logo.svg?url";

interface Props {
  message?: string;
  spinDurationMs?: number;
}

const SuccessCheck: React.FC<Props> = ({
  message = "Veriler gönderildi. Lütfen sonraki talimatları bekleyin.",
  spinDurationMs = 1200,
}) => {
  const [showCheck, setShowCheck] = useState(false);

  return (
    <section className="flex items-center justify-center min-h-[30vh] bg-slate-950 text-slate-50 px-4">
      <div className="relative w-full max-w-md">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <img
            src={logoUrl}
            alt=""
            className="
              select-none pointer-events-none opacity-60
              absolute left-1/2 top-1/2
              -translate-x-1/2 -translate-y-[60%]   #logoheight
              w-[92%] md:w-[95%] max-w-none
            "
            style={{ filter: "blur(0.3px)" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        {/* Карточка */}
        <div className="relative z-10 rounded-2xl bg-slate-900/80 shadow-lg backdrop-blur-sm p-8 text-center">
          <AnimatePresence mode="wait">
            {!showCheck ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: spinDurationMs / 1000, ease: "easeInOut" }}
                onAnimationComplete={() => setShowCheck(true)}
                className="mx-auto w-16 h-16 rounded-full border-4 border-green-400 border-t-transparent"
              />
            ) : (
              <motion.div
                key="check"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.08, 1], opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mx-auto grid place-items-center size-20 rounded-full"
                style={{ backgroundColor: "rgba(34,197,94,0.18)" }}
              >
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    d="M20 6L9 17l-5-5"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {showCheck && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-slate-100"
            >
              {message}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SuccessCheck;
