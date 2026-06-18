import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { getOnboardingStatus, getPostLoginRedirect } from "../services/onboardingService";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      const status = await getOnboardingStatus();
      navigate(getPostLoginRedirect(status));
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Log in to sync with your CarbonTwin.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="label">Email</span>
            <input className="field mt-1" name="email" type="email" required />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="field mt-1" name="password" type="password" required />
          </label>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          New here? <Link className="text-neon-green" to="/signup">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
