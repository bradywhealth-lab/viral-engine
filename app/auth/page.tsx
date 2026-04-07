"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";

const ACCESS_CODE = "VIRALENGINE2026";

export default function AuthPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      localStorage.setItem("vev-auth", "1");
      document.cookie = "vev-auth=1; path=/; max-age=31536000; SameSite=Lax";
      router.push("/");
    } else {
      setError("Invalid access code");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1623] p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#1e2d45] shadow-2xl">
        <div className="grid md:grid-cols-2">
          {/* Left — branding */}
          <div className="flex flex-col justify-between bg-[radial-gradient(circle_at_top_right,rgba(79,142,247,0.15),transparent_50%),linear-gradient(135deg,#141e2e,#0f1623)] p-8 md:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f8ef7] to-[#38bdf8]">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8899bb]">Creator OS</span>
            </div>

            <div className="mt-12 md:mt-0">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#f0f4ff] md:text-4xl">
                Viral Engine Views
              </h1>
              <p className="mt-3 text-base text-[#8899bb] leading-relaxed">
                Mine trends. Create content.<br />Dominate your niche.
              </p>
            </div>

            <div className="mt-8 hidden md:block">
              <div className="rounded-2xl border border-[#1e2d45]/60 bg-[#0f1623]/40 p-4">
                <p className="text-xs text-[#8899bb]">AI trend scanner, content queue, cards suite, giveaways, and analytics — all in one OS.</p>
              </div>
            </div>
          </div>

          {/* Right — access code form */}
          <div className="flex flex-col justify-center bg-[#141e2e] p-8 md:p-10">
            <div>
              <h2 className="text-xl font-semibold text-[#f0f4ff]">Enter Access Code</h2>
              <p className="mt-1 text-sm text-[#8899bb]">This tool is private. Enter your access code to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="access-code" className="text-sm font-medium text-[#f0f4ff]/90">
                  Access Code
                </label>
                <input
                  id="access-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your access code"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex h-11 w-full rounded-xl border border-[#1e2d45] bg-[#1a2540] px-4 text-sm text-[#f0f4ff] placeholder:text-[#8899bb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ef7]/70 transition-all"
                />
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#4f8ef7] text-sm font-medium text-white transition-colors hover:bg-[#4f8ef7]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ef7]/70"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
