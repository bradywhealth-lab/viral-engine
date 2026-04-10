"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Eye, EyeOff, Loader2, Sparkles, TrendingUp, BarChart3, ArrowRight } from "lucide-react";

type ActiveForm = null | "signin" | "signup";

export default function AuthPage() {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const openForm = (form: ActiveForm) => {
    resetForm();
    setActiveForm(form);
  };

  useEffect(() => {
    if (activeForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [activeForm]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!password) { setError("Password is required"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign in failed"); return; }
      localStorage.setItem("vev-auth", "1");
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email address"); return; }
    if (!password) { setError("Password is required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          confirmPassword,
          name: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign up failed"); return; }
      localStorage.setItem("vev-auth", "1");
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e6]">
      {/* ─── NAV BAR ─── */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d6a43d] to-[#f0c96a] shadow-md">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#2f2418]">
            Viral Engine Views
          </span>
        </div>
        <button
          type="button"
          onClick={() => openForm("signin")}
          className="rounded-xl border border-[#d6a43d] px-5 py-2 text-sm font-semibold text-[#d6a43d] transition-colors hover:bg-[#d6a43d] hover:text-white"
        >
          Sign In
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section className="flex flex-col items-center px-6 pb-16 pt-12 text-center sm:px-10 sm:pt-20 lg:pt-28">
        {/* Decorative badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8dcc6] bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#8a7a67] shadow-sm backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#d6a43d]" />
          Creator-first growth tools
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-[#2f2418] sm:text-5xl lg:text-6xl">
          Go Viral.{" "}
          <span className="bg-gradient-to-r from-[#d6a43d] to-[#e8b84a] bg-clip-text text-transparent">
            Get Views.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6f6254] sm:text-lg">
          Discover trends before they peak, plan content that converts, and
          manage campaigns — all from one powerful workspace.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => openForm("signup")}
            className="group flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d6a43d] to-[#e8b84a] px-8 text-sm font-semibold text-white shadow-lg shadow-[#d6a43d]/25 transition-all hover:shadow-xl hover:shadow-[#d6a43d]/30 hover:brightness-105"
          >
            Create Account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => openForm("signin")}
            className="flex h-12 items-center gap-2 rounded-2xl border border-[#decfb7] bg-white px-8 text-sm font-semibold text-[#2f2418] shadow-sm transition-all hover:border-[#d6a43d] hover:shadow-md"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="mx-auto grid max-w-4xl gap-4 px-6 pb-16 sm:grid-cols-3 sm:px-10">
        {[
          { icon: TrendingUp, title: "Trend Discovery", desc: "Spot viral opportunities before the crowd catches on." },
          { icon: BarChart3, title: "Content Analytics", desc: "Track what performs, learn what converts, and iterate fast." },
          { icon: Sparkles, title: "Campaign Tools", desc: "Plan giveaways, schedule posts, and manage multiple niches." },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-[#eadfcd] bg-white/70 p-6 backdrop-blur-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf3e4]">
              <Icon className="h-5 w-5 text-[#d6a43d]" />
            </div>
            <h3 className="text-sm font-bold text-[#2f2418]">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#6f6254]">{desc}</p>
          </div>
        ))}
      </section>

      {/* ─── AUTH FORM (shown after CTA click) ─── */}
      {activeForm && (
        <section
          ref={formRef}
          className="mx-auto max-w-md px-6 pb-20 sm:px-0"
        >
          <div className="overflow-hidden rounded-3xl border border-[#e2d6c2] bg-white shadow-[0_30px_80px_rgba(116,85,33,0.12)]">
            <div className="p-8 sm:p-10">
              {/* Tab switcher */}
              <div className="flex rounded-xl border border-[#e2d6c2] bg-[#f7f1e6] p-1">
                <button
                  type="button"
                  onClick={() => openForm("signin")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    activeForm === "signin"
                      ? "bg-white text-[#2f2418] shadow-sm"
                      : "text-[#8a7a67] hover:text-[#6f6254]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openForm("signup")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    activeForm === "signup"
                      ? "bg-white text-[#2f2418] shadow-sm"
                      : "text-[#8a7a67] hover:text-[#6f6254]"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <p className="mt-4 text-sm text-[#8a7a67]">
                {activeForm === "signin"
                  ? "Welcome back. Sign in to continue."
                  : "Create your account to get started."}
              </p>

              {/* Error */}
              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Sign In form */}
              {activeForm === "signin" && (
                <form onSubmit={handleSignIn} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signin-email" className="text-sm font-medium text-[#4c4033]">
                      Email
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signin-password" className="text-sm font-medium text-[#4c4033]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 pr-11 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7a67] hover:text-[#6f6254]"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-[#d6a43d] hover:text-[#c49332] transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d6a43d] text-sm font-medium text-white transition-colors hover:bg-[#c49332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              )}

              {/* Sign Up form */}
              {activeForm === "signup" && (
                <form onSubmit={handleSignUp} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="text-sm font-medium text-[#4c4033]">
                      Name <span className="text-[#8a7a67]">(optional)</span>
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      placeholder="Your name"
                      autoComplete="name"
                      className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-sm font-medium text-[#4c4033]">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium text-[#4c4033]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 pr-11 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7a67] hover:text-[#6f6254]"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-confirm" className="text-sm font-medium text-[#4c4033]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 pr-11 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7a67] hover:text-[#6f6254]"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d6a43d] text-sm font-medium text-white transition-colors hover:bg-[#c49332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#eadfcd] py-8 text-center text-xs text-[#8a7a67]">
        © {new Date().getFullYear()} Viral Engine Views. All rights reserved.
      </footer>
    </div>
  );
}
