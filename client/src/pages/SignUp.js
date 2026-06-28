import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/shared/Brand";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PasswordInput";
import Spinner from "../components/shared/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    userName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.firstName.trim()) return "Please enter your first name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (form.email !== form.confirmEmail) return "Email addresses don't match.";
    if (form.userName.trim().length < 3)
      return "Username must be at least 3 characters.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    try {
      const user = await signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        userName: form.userName.trim(),
        password: form.password,
      });
      toast.success(`Welcome to Moodwave, ${user.firstName}!`);
      navigate("/home");
    } catch (err) {
      toast.error(err.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full flex items-center justify-center bg-gradient-to-b from-ink-850 to-ink-950 px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-ink-900 border border-ink-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-7 gap-4">
          <Brand iconSize={40} />
          <h1 className="text-2xl font-bold text-white text-center">
            Sign up to start listening
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <TextInput label="First name" placeholder="Alex" value={form.firstName} onChange={set("firstName")} name="firstName" />
            <TextInput label="Last name" placeholder="Doe" value={form.lastName} onChange={set("lastName")} name="lastName" />
          </div>
          <TextInput label="Email" placeholder="you@example.com" value={form.email} onChange={set("email")} name="email" autoComplete="email" />
          <TextInput label="Confirm email" placeholder="you@example.com" value={form.confirmEmail} onChange={set("confirmEmail")} name="confirmEmail" />
          <TextInput label="Username" placeholder="Pick a username" value={form.userName} onChange={set("userName")} name="userName" autoComplete="username" />
          <PasswordInput label="Password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} name="password" autoComplete="new-password" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-7 flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-60"
        >
          {loading ? <Spinner size={20} className="text-black" /> : "Create account"}
        </button>

        <div className="my-6 border-t border-ink-800" />
        <p className="text-center text-sm text-ink-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
