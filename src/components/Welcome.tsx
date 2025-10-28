// src/components/Welcome.tsx
import React from "react";
import logoUrl from "./image/logo.svg?url";

type Props = { onContinue: () => void };

const Welcome: React.FC<Props> = ({ onContinue }) => (
  <section className="relative min-h-[60vh] grid place-items-center bg-gradient-to-b from-blue-950 to-slate-950 text-slate-50 overflow-hidden">
    {/* Фон-логотип */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      <img
        src={logoUrl}
        alt=""
        className="
          select-none pointer-events-none
          opacity-60
          w-[70vmin] max-w-[560px] md:max-w-[720px]
        "
        style={{ filter: "blur(0.2px)" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>

    <div className="relative w-full max-w-xl p-6 md:p-10 text-center">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-xl">
        Sizi DIJITAL BORSA şirketi karşılıyor
      </h1>
      <p className="mt-3 text-slate-300">
        Basit formu doldurun. 🔒 Verilerinizi şifreleme ve diğer güvenlik önlemleriyle koruyoruz. 🗝️
      </p>
      <button
        onClick={onContinue}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 outline-none ring-offset-2 transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400"
      >
        Devam et
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M5 12h14M13 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  </section>
);

export default Welcome;
