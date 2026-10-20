"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { registerUser, loginUser } from "@/lib/api";

export default function HomePage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    company_name: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res;
      if (isLogin) {
        res = await loginUser({
          email: form.email,
          password: form.password,
        });
      } else {
        res = await registerUser(form);
      }
      login(res);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* ── Background Decorations ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[128px] animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[128px] animate-pulse-slow" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      {/* ── Grid Lines (subtle) ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* ── Logo / Brand ── */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs font-medium text-brand-300">
              Multi-Tenant SaaS Platform
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">IndaureX</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {isLogin
              ? "Welcome back. Sign in to your account."
              : "Create your account and connect WhatsApp in minutes."}
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="glass-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Name — only on register */}
            {!isLogin && (
              <div className="animate-slide-down">
                <label
                  htmlFor="company_name"
                  className="mb-1.5 block text-xs font-medium text-white/60"
                >
                  Company Name
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  required={!isLogin}
                  placeholder="Acme Inc."
                  value={form.company_name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-white/60"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-white/60"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                value={form.password}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="animate-slide-down rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                <span className="mr-1.5">⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="31.416"
                      strokeDashoffset="10"
                      strokeLinecap="round"
                      className="opacity-40"
                    />
                  </svg>
                  Processing…
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* ── Toggle ── */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-xs text-white/40 transition-colors hover:text-white/70"
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="mt-6 text-center text-[11px] text-white/25">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
