"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN"
      ) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError(
        "Your new password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(
          "We could not update your password. The reset link may have expired. Please request a new one."
        );
        return;
      }

      setMessage(
        "Your Smart Tech administrator password has been updated successfully."
      );

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/admin");
      }, 1800);
    } catch {
      setError(
        "Something went wrong while updating your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#052f50] via-[#075a8e] to-[#0798ef] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-3xl bg-white p-7 shadow-2xl sm:p-10">
          <Image
            src="/images/logo/smart-tech-logo.jpg"
            alt="Smart Tech"
            width={190}
            height={95}
            priority
            className="h-20 w-auto object-contain"
          />

          <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] text-[#0798ef]">
            Secure Administration
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#0b2947]">
            Create New Password
          </h1>

          <p className="mt-2 leading-6 text-slate-500">
            Choose a new password for your Smart Tech
            administrator account.
          </p>

          {!ready ? (
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Open this page using the password reset link sent
              to your administrator email address.
            </div>
          ) : (
            <form
              onSubmit={handleReset}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="new-password"
                  className="text-sm font-bold text-slate-700"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-[#0798ef] focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-bold text-slate-700"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter the password again"
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
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0798ef] px-5 py-3.5 font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#087bd0] hover:shadow-[0_0_24px_rgba(7,152,239,.4)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Updating Password..."
                  : "Update Password"}
              </button>
            </form>
          )}

          <div className="mt-7 border-t border-slate-200 pt-6">
            <a
              href="/admin"
              className="text-sm font-bold text-[#0798ef] hover:underline"
            >
              ← Back to Admin Login
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}