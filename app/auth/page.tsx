"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";

export default function AuthPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        // Set client-side flag for ConditionalShell (cookie is HttpOnly, set by server)
        localStorage.setItem("vev-auth", "1");
        router.push("/");
      } else {
        setError("Invalid access code");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f1e6] p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#e2d6c2] bg-white shadow-[0_30px_80px_rgba(116,85,33,0.12)]">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-between bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_50%),linear-gradient(135deg,#fffaf2,#f3e8d4)] p-8 md:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d6a43d] to-[#f0c96a]">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7a67]">Creator workspace</span>
            </div>

            <div className="mt-12 md:mt-0">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#2f2418] md:text-4xl">
                Viral Engine Views
              </h1>
              <p className="mt-3 text-base leading-relaxed text-[#6f6254]">
                Start clean, shape your system,
                <br />
                and grow any niche your way.
              </p>
            </div>

            <div className="mt-8 hidden md:block">
              <div className="rounded-2xl border border-[#eadfcd] bg-white/70 p-4">
                <p className="text-xs text-[#6f6254]">Trend discovery, content planning, and campaign tools in one reusable workspace.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-[#fffdf9] p-8 md:p-10">
            <div>
              <h2 className="text-xl font-semibold text-[#2f2418]">Enter Access Code</h2>
              <p className="mt-1 text-sm text-[#8a7a67]">This tool is private. Enter your access code to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="access-code" className="text-sm font-medium text-[#4c4033]">
                  Access Code
                </label>
                <input
                  id="access-code"
                  type="password"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your access code"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex h-11 w-full rounded-xl border border-[#decfb7] bg-white px-4 text-sm text-[#2f2418] placeholder:text-[#8a7a67] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-[#d6a43d] text-sm font-medium text-white transition-colors hover:bg-[#c49332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a43d]/60 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Enter"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
