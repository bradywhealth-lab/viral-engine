"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f1e6] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#e2d6c2] bg-white shadow-[0_30px_80px_rgba(116,85,33,0.12)]">
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d6a43d] to-[#f0c96a]">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7a67]">
              Password Reset
            </span>
          </div>

          {!submitted ? (
            <>
              <h1 className="text-2xl font-bold text-[#2f2418]">Forgot your password?</h1>
              <p className="mt-2 text-sm text-[#8a7a67]">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium text-[#4c4033]">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d6a43d] text-sm font-medium text-white transition-colors hover:bg-[#c49332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f1e6]">
                <Mail className="h-7 w-7 text-[#d6a43d]" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-[#2f2418]">Check your email</h1>
              <p className="mt-2 text-sm text-[#8a7a67]">
                If an account with that email exists, we&apos;ve sent a password reset link.
                Check your inbox and spam folder.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d6a43d] hover:text-[#c49332] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
