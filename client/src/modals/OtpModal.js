import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "../components/shared/Modal";
import Spinner from "../components/shared/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Verifies an email address or phone number via a 6-digit one-time passcode.
// The code is simulated server-side and echoed back as `devCode`, which we
// surface as a demo hint so the flow is testable without a real SMS/email gateway.
const OtpModal = ({ channel, target, onClose, onVerified }) => {
  const { sendOtp, verifyOtp } = useAuth();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [sending, setSending] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const sentOnce = useRef(false);

  const isPhone = channel === "phone";

  const send = async () => {
    setSending(true);
    try {
      const res = await sendOtp(channel);
      if (res?.devCode) setDevCode(res.devCode);
      toast.success(res?.message || "Code sent.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  // Send a code automatically when the modal opens (guard against StrictMode double-run).
  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async () => {
    if (code.trim().length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setVerifying(true);
    try {
      const res = await verifyOtp(channel, code.trim());
      toast.success(res?.message || "Verified.");
      onVerified?.();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal
      title={`Verify your ${isPhone ? "phone number" : "email"}`}
      subtitle={`Enter the 6-digit code we sent to ${target}.`}
      onClose={onClose}
    >
      <div className="space-y-4">
        {devCode && (
          <div className="flex items-center gap-2 text-sm bg-accent/10 border border-accent/30 text-accent rounded-lg px-3 py-2">
            <Icon icon="mdi:information" width={18} />
            <span>
              Demo code:{" "}
              <span className="font-bold tracking-widest text-white">
                {devCode}
              </span>
            </span>
          </div>
        )}

        <input
          inputMode="numeric"
          autoFocus
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && verify()}
          placeholder="••••••"
          className="w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-600 focus:outline-none focus:border-brand"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={verify}
            disabled={verifying || sending}
            className="flex-1 bg-brand hover:bg-brand-light text-black font-bold px-6 py-2.5 rounded-full transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {verifying ? <Spinner size={18} className="text-black" /> : "Verify"}
          </button>
          <button
            onClick={send}
            disabled={sending}
            className="text-sm font-semibold text-ink-300 hover:text-white disabled:opacity-60 px-3"
          >
            {sending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OtpModal;
