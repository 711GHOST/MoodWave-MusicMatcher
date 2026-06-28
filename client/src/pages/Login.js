import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/shared/Brand";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PasswordInput";
import Spinner from "../components/shared/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter your email/username and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate("/home");
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full flex items-center justify-center bg-gradient-to-b from-ink-850 to-ink-950 px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-ink-900 border border-ink-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8 gap-4">
          <Brand iconSize={40} />
          <h1 className="text-2xl font-bold text-white">Log in to Moodwave</h1>
        </div>

        <div className="space-y-4">
          <TextInput
            label="Email or username"
            placeholder="demo@moodwave.app"
            value={identifier}
            onChange={setIdentifier}
            name="identifier"
            autoComplete="username"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={setPassword}
            name="password"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-7 flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-60"
        >
          {loading ? <Spinner size={20} className="text-black" /> : "Log in"}
        </button>

        <div className="my-6 border-t border-ink-800" />
        <p className="text-center text-sm text-ink-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-white font-semibold hover:underline">
            Sign up for Moodwave
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
