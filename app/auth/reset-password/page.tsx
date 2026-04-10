"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Flame, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#2f2418]">Invalid Reset Link</h1>
        <p className="mt-2 text-sm text-[#8a7a67]">
          This password reset link is invalid or missing a token. Please request a new one.
        </p>
        <div className="mt-6">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d6a43d] hover:text-[#c49332] transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
      // Redirect to sign in after 3 seconds
      setTimeout(() => router.push("/auth"), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-7 w-7 text-green-500" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-[#2f2418]">Password Reset!</h1>
        <p className="mt-2 text-sm text-[#8a7a67]">
          Your password has been successfully reset. Redirecting to sign in...
        </p>
        <div className="mt-6">
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d6a43d] hover:text-[#c49332] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#2f2418]">Reset your password</h1>
      <p className="mt-2 text-sm text-[#8a7a67]">
        Enter your new password below.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium text-[#4c4033]">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              autoFocus
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
          <label htmlFor="confirm-password" className="text-sm font-medium text-[#4c4033]">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              placeholder="Confirm your new password"
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
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d6a43d] hover:text-[#c49332] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
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

          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#d6a43d]" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
