"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseBrowser";

type AuthFormProps = {
  mode: "signin" | "signup";
  redirectTo?: string;
};

export function AuthForm({ mode, redirectTo = "/dashboard" }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="sb-card sb-stack"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
          const supabase = getSupabaseBrowserClient();

          if (mode === "signup") {
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password
            });

            if (signUpError) {
              throw signUpError;
            }

            setMessage("Account created. If email confirmation is enabled, confirm your email, then sign in.");
            setPassword("");
          } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });

            if (signInError) {
              throw signInError;
            }

            router.push(redirectTo);
            router.refresh();
          }
        } catch (authError) {
          setError(
            authError instanceof Error
              ? authError.message
              : "Authentication failed."
          );
        } finally {
          setLoading(false);
        }
      }}
    >
      <p className="sb-eyebrow">
        {mode === "signup" ? "Create account" : "Sign in"}
      </p>
      <h2>{mode === "signup" ? "Create your account" : "Access your dashboard"}</h2>
      <input
        className="sb-field"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        className="sb-field"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />
      <div className="sb-inline-actions">
        <button className="sb-button" type="submit" disabled={loading}>
          {loading
            ? "Working..."
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
        <button
          className="sb-button-secondary"
          type="button"
          onClick={() => router.push(mode === "signup" ? "/login" : "/signup")}
        >
          {mode === "signup" ? "Go to sign in" : "Go to sign up"}
        </button>
      </div>
      {message ? <div className="sb-banner success">{message}</div> : null}
      {error ? <div className="sb-banner error">{error}</div> : null}
    </form>
  );
}
