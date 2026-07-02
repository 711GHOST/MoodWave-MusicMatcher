import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Icon } from "@iconify/react";
import Modal from "../shared/Modal";
import Spinner from "../shared/Spinner";
import { luhnValid } from "../../utils/cardBrand";

// Pulls a likely card number + expiry out of raw OCR text.
const parseCard = (text) => {
  let number = null;
  const groups = (text.match(/(?:\d[\s-]*){13,19}/g) || []).map((s) =>
    s.replace(/\D/g, "")
  );
  number = groups.find((c) => c.length >= 13 && c.length <= 19 && luhnValid(c));
  if (!number) {
    const all = text.replace(/\D/g, "");
    for (const len of [16, 15, 19, 14, 13]) {
      for (let i = 0; i + len <= all.length; i += 1) {
        const sub = all.slice(i, i + len);
        if (luhnValid(sub)) {
          number = sub;
          break;
        }
      }
      if (number) break;
    }
  }
  const exp = text.match(/(0[1-9]|1[0-2])\s*\/\s*(\d{2})/);
  return { number: number || "", expiry: exp ? `${exp[1]}/${exp[2]}` : "" };
};

const CardScanner = ({ onScanned, onClose }) => {
  const webcamRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [camError, setCamError] = useState(false);

  const scan = async () => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) {
      setStatus("Camera isn't ready yet - give it a moment.");
      return;
    }
    setBusy(true);
    setStatus("Reading your card…");
    try {
      // Loaded on demand so it never bloats the main bundle.
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(shot);
      await worker.terminate();

      const { number, expiry } = parseCard(text);
      if (!number) {
        setStatus("Couldn't read the number clearly. Try again or type it in.");
        return;
      }
      onScanned({ number, expiry });
      onClose();
    } catch (e) {
      setStatus(
        "Scanning isn't available right now. Please enter the card details manually."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Scan your card"
      subtitle="Hold the front of your card steady inside the frame. We never store the image."
      onClose={onClose}
    >
      <div className="space-y-4">
        {camError ? (
          <div className="bg-ink-800 rounded-xl p-6 text-center text-sm text-ink-400">
            Couldn't access the camera. Check permissions, or enter the card
            details manually.
          </div>
        ) : (
          <div className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden bg-black">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              onUserMediaError={() => setCamError(true)}
              className="w-full h-full object-cover"
            />
            <div className="pointer-events-none absolute inset-4 border-2 border-white/70 rounded-lg" />
          </div>
        )}

        {status && <p className="text-sm text-ink-300 text-center">{status}</p>}

        <button
          onClick={scan}
          disabled={busy || camError}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-60"
        >
          {busy ? (
            <Spinner size={20} className="text-black" />
          ) : (
            <Icon icon="mdi:camera" width={20} />
          )}
          {busy ? "Scanning…" : "Capture & scan"}
        </button>
        <p className="text-xs text-ink-500 text-center">
          For your security, the CVV is never scanned - enter it manually.
        </p>
      </div>
    </Modal>
  );
};

export default CardScanner;
