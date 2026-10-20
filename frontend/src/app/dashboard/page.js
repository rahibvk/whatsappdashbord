"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboard, saveTwilioConfig } from "@/lib/api";

// ── Icons (inline SVGs) ──

function IconShield() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function IconPlug() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

// ── Main Dashboard Component ──

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);
  const [error, setError] = useState("");

  // Twilio form state
  const [showTwilioForm, setShowTwilioForm] = useState(false);
  const [twilioForm, setTwilioForm] = useState({
    account_sid: "",
    auth_token: "",
    whatsapp_number: "",
  });
  const [twilioLoading, setTwilioLoading] = useState(false);
  const [twilioError, setTwilioError] = useState("");
  const [twilioSuccess, setTwilioSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDash(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  // Handle Twilio form submission
  async function handleTwilioSubmit(e) {
    e.preventDefault();
    setTwilioLoading(true);
    setTwilioError("");
    setTwilioSuccess(false);

    try {
      await saveTwilioConfig(twilioForm);
      setTwilioSuccess(true);
      setShowTwilioForm(false);
      // Refresh dashboard to get updated status + webhook URL
      await fetchDashboard();
    } catch (err) {
      setTwilioError(err.message || "Failed to save Twilio configuration");
    } finally {
      setTwilioLoading(false);
    }
  }

  function handleTwilioChange(e) {
    setTwilioForm({ ...twilioForm, [e.target.name]: e.target.value });
    setTwilioError("");
  }

  async function copyWebhookUrl() {
    if (dashboard?.webhook_url) {
      await navigator.clipboard.writeText(dashboard.webhook_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Loading state
  if (authLoading || loadingDash) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500" />
          <p className="text-sm text-white/40">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-card max-w-md text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={logout} className="btn-secondary mt-4">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* ── Background ── */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* ── Top Nav ── */}
      <nav className="relative z-20 border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold gradient-text">IndaureX</h1>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/40 sm:inline-block">
              {dashboard?.tenant?.company_name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/40 sm:block">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <IconLogout />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        {/* Welcome Header */}
        <div className="mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back,{" "}
            <span className="gradient-text">
              {dashboard?.tenant?.company_name}
            </span>
          </h2>
          <p className="mt-2 text-sm text-white/40">
            Manage your integrations and configure your WhatsApp automation
            pipeline.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
              <IconShield />
            </div>
            <div>
              <p className="text-xs text-white/40">Tenant ID</p>
              <p className="mt-0.5 font-mono text-xs text-white/70">
                {String(dashboard?.tenant?.id).slice(0, 8)}…
              </p>
            </div>
          </div>

          <div className="glass-card flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <IconPlug />
            </div>
            <div>
              <p className="text-xs text-white/40">Integration Status</p>
              {dashboard?.twilio_configured ? (
                <span className="badge-success mt-1">
                  <IconCheck /> Connected
                </span>
              ) : (
                <span className="badge-warning mt-1">Not Configured</span>
              )}
            </div>
          </div>

          <div className="glass-card flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <IconWhatsApp />
            </div>
            <div>
              <p className="text-xs text-white/40">WhatsApp</p>
              <p className="mt-0.5 text-sm font-medium text-white/70">
                {dashboard?.twilio_configured ? "Active" : "Pending Setup"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Connect Integrations Section ── */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="mb-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Connect Integrations
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Twilio Card */}
          <div className="glass-card">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Left — Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    Twilio WhatsApp Integration
                  </h4>
                  <p className="mt-1 text-xs text-white/40 max-w-md">
                    Connect your Twilio account to send and receive WhatsApp
                    messages. You&apos;ll need your Account SID, Auth Token, and a
                    WhatsApp-enabled phone number.
                  </p>
                </div>
              </div>

              {/* Right — Action */}
              {!dashboard?.twilio_configured && !showTwilioForm && (
                <button
                  onClick={() => setShowTwilioForm(true)}
                  className="btn-primary shrink-0 !w-auto"
                >
                  Configure
                </button>
              )}

              {dashboard?.twilio_configured && (
                <div className="flex items-center gap-2">
                  <span className="badge-success">
                    <IconCheck /> Connected
                  </span>
                  <button
                    onClick={() => {
                      setShowTwilioForm(true);
                      setTwilioSuccess(false);
                    }}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    Update
                  </button>
                </div>
              )}
            </div>

            {/* ── Twilio Configuration Form ── */}
            {showTwilioForm && (
              <div className="mt-6 animate-slide-down border-t border-white/5 pt-6">
                <form onSubmit={handleTwilioSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="account_sid"
                        className="mb-1.5 block text-xs font-medium text-white/60"
                      >
                        Account SID
                      </label>
                      <input
                        id="account_sid"
                        name="account_sid"
                        type="text"
                        required
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={twilioForm.account_sid}
                        onChange={handleTwilioChange}
                        className="input-field font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="auth_token"
                        className="mb-1.5 block text-xs font-medium text-white/60"
                      >
                        Auth Token
                      </label>
                      <input
                        id="auth_token"
                        name="auth_token"
                        type="password"
                        required
                        placeholder="Your Twilio Auth Token"
                        value={twilioForm.auth_token}
                        onChange={handleTwilioChange}
                        className="input-field font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="whatsapp_number"
                      className="mb-1.5 block text-xs font-medium text-white/60"
                    >
                      WhatsApp Number (E.164)
                    </label>
                    <input
                      id="whatsapp_number"
                      name="whatsapp_number"
                      type="text"
                      required
                      placeholder="+14155238886"
                      value={twilioForm.whatsapp_number}
                      onChange={handleTwilioChange}
                      className="input-field font-mono text-xs"
                    />
                  </div>

                  {/* Error */}
                  {twilioError && (
                    <div className="animate-slide-down rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                      <span className="mr-1.5">⚠</span>
                      {twilioError}
                    </div>
                  )}

                  {/* Security note */}
                  <div className="flex items-start gap-2 rounded-lg border border-brand-500/10 bg-brand-500/5 px-4 py-3">
                    <IconShield />
                    <p className="text-xs text-white/50">
                      Your credentials are <strong className="text-white/70">encrypted at rest</strong> using
                      AES-128 (Fernet) and are <strong className="text-white/70">never returned</strong> to the
                      browser after saving.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={twilioLoading}
                      className="btn-primary !w-auto"
                    >
                      {twilioLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.416" strokeDashoffset="10" strokeLinecap="round" className="opacity-40" />
                          </svg>
                          Saving…
                        </span>
                      ) : (
                        "Save Configuration"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTwilioForm(false);
                        setTwilioError("");
                      }}
                      className="btn-secondary !w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Webhook URL Display ── */}
            {dashboard?.twilio_configured && dashboard?.webhook_url && (
              <div className="mt-6 animate-slide-down border-t border-white/5 pt-6">
                <h5 className="mb-3 text-sm font-semibold text-white/80">
                  🔗 Webhook Configuration
                </h5>
                <p className="mb-4 text-xs text-white/40 leading-relaxed">
                  Copy the URL below and paste it into your{" "}
                  <a
                    href="https://console.twilio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
                  >
                    Twilio Console
                  </a>{" "}
                  under{" "}
                  <strong className="text-white/60">
                    Messaging → Settings → WhatsApp Sandbox → &quot;When a
                    message comes in&quot;
                  </strong>
                  .
                </p>

                {/* URL Copy Box */}
                <div className="group flex items-center gap-2 rounded-xl border border-white/10 bg-surface-900 p-1">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap px-3 py-2 font-mono text-xs text-brand-300">
                    {dashboard.webhook_url}
                  </code>
                  <button
                    onClick={copyWebhookUrl}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      copied
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <IconCheck /> Copied!
                      </>
                    ) : (
                      <>
                        <IconCopy /> Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Setup Steps */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Setup Instructions
                  </p>
                  {[
                    "Log in to your Twilio Console at console.twilio.com",
                    'Navigate to Messaging → Settings → WhatsApp Sandbox',
                    'Find the field labeled "When a message comes in"',
                    "Paste the webhook URL above into that field",
                    'Set the HTTP method to POST and click "Save"',
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[10px] font-bold text-brand-400">
                        {i + 1}
                      </span>
                      <p className="text-xs text-white/50">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Toast */}
            {twilioSuccess && (
              <div className="mt-4 animate-slide-down flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
                <IconCheck />
                Twilio credentials saved and encrypted successfully!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
