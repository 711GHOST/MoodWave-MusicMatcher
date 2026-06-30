import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Brand from "../components/shared/Brand";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PasswordInput";
import Spinner from "../components/shared/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = request code, 2 = reset
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devCode, setDevCode] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your account email.");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res?.devCode) setDevCode(res.devCode);
      toast.success(res?.message || "If that email exists, a code was sent.");
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      toast.success("Password updated. You're signed in.");
      navigate("/home");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full flex items-center justify-center bg-gradient-to-b from-ink-850 to-ink-950 px-4 py-10">
      <div className="w-full max-w-md bg-ink-900 border border-ink-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8 gap-4">
          <Brand iconSize={40} />
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-ink-400 text-center">
            {step === 1
              ? "Enter your account email and we'll send a 6-digit code."
              : `Enter the code sent to ${email} and choose a new password.`}
          </p>
        </div>

        {devCode && step === 2 && (
          <div className="flex items-center gap-2 text-sm bg-accent/10 border border-accent/30 text-accent rounded-lg px-3 py-2 mb-4">
            <Icon icon="mdi:information" width={18} />
            <span>
              Demo code:{" "}
              <span className="font-bold tracking-widest text-white">
                {devCode}
              </span>
            </span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={requestCode} className="space-y-4">
            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              name="email"
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-60"
            >
              {loading ? <Spinner size={20} className="text-black" /> : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={doReset} className="space-y-4">
            <TextInput
              label="6-digit code"
              placeholder="123456"
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              name="code"
            />
            <PasswordInput
              label="New password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={setNewPassword}
              name="newPassword"
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-60"
            >
              {loading ? (
                <Spinner size={20} className="text-black" />
              ) : (
                "Reset password"
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-ink-400 hover:text-white"
            >
              Use a different email
            </button>
          </form>
        )}

        <div className="my-6 border-t border-ink-800" />
        <p className="text-center text-sm text-ink-400">
          Remembered it?{" "}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
