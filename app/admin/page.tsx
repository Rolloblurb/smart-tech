"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCheckingSession(false);
        return;
      }

      const { data: admin } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (admin) {
        router.replace("/admin/dashboard");
        return;
      }

      await supabase.auth.signOut();
      setCheckingSession(false);
    };

    checkExistingSession();
  }, [router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError("Incorrect email or password.");
        return;
      }

      if (!data.user) {
        setError("Unable to sign in.");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();

        setError(
          "This account does not have Smart Tech administrator access."
        );

        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError(
        "Enter your administrator email address first, then click Forgot password."
      );
      return;
    }

    setResetLoading(true);

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/admin/reset-password`
          : undefined;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });

      if (resetError) {
        setError(
          "We could not send the password reset email. Please check the email address and try again."
        );
        return;
      }

      setMessage(
        "If this email belongs to an authorized Smart Tech account, password reset instructions have been sent."
      );
    } catch {
      setError("Something went wrong while requesting the password reset.");
    } finally {
      setResetLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f8fc]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0798ef]" />

          <p className="mt-4 font-semibold text-slate-600">
            Checking administrator session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#052f50] via-[#075a8e] to-[#0798ef] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

          {/* LEFT SIDE */}
          <section className="hidden bg-[#06365b] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-block rounded-2xl bg-white p-3">
                <Image
                  src="/images/logo/smart-tech-logo.jpg"
                  alt="Smart Tech"
                  width={220}
                  height={110}
                  priority
                  className="h-20 w-auto object-contain"
                />
              </div>

              <h1 className="mt-10 text-4xl font-black">
                Smart Tech
                <span className="block text-[#25b9ff]">
                  Administration
                </span>
              </h1>

              <p className="mt-5 max-w-sm leading-7 text-white/70">
                Manage products, pricing, stock, Lipa Mdogo Mdogo plans,
                product images and customer feedback.
              </p>
            </div>

            <p className="text-sm text-white/50">
              Smart Products. A Brighter Tomorrow.
            </p>
          </section>

          {/* LOGIN FORM */}
          <section className="p-7 sm:p-10 lg:p-12">
            <div className="lg:hidden">
              <Image
                src="/images/logo/smart-tech-logo.jpg"
                alt="Smart Tech"
                width={190}
                height={95}
                priority
                className="h-20 w-auto object-contain"
              />
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-[#0798ef] lg:mt-0">
              Secure Administration
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#0b2947]">
              Admin Login
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in using your authorized Smart Tech administrator account.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="admin-email"
                  className="text-sm font-bold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-[#0798ef] focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-sm font-bold text-[#0798ef] transition hover:text-[#06365b] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetLoading
                      ? "Sending..."
                      : "Forgot password?"}
                  </button>
                </div>

                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-[#0798ef] focus:ring-4 focus:ring-sky-100"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-700"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0798ef] px-5 py-3.5 font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#087bd0] hover:shadow-[0_0_24px_rgba(7,152,239,.4)] active:translate-y-0 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In to Dashboard"}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-200 pt-6">
              <a
                href="/"
                className="text-sm font-bold text-[#0798ef] transition hover:text-[#06365b]"
              >
                ← Return to Smart Tech website
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}