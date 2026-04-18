import { createSupabaseServerClient } from "./lib/supabaseServer";
import { SignOutButton } from "./components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="sb-shell">
      <nav className="sb-nav">
        <div>
          <div className="sb-brand">Saint Black Command</div>
          <div className="sb-status">
            Public homepage
          </div>
        </div>
        <div className="sb-nav-links">
          <a className="sb-button-secondary" href="/pricing">
            Pricing
          </a>
          {user ? (
            <>
              <a className="sb-button-secondary" href="/dashboard">
                Dashboard
              </a>
              <SignOutButton />
            </>
          ) : (
            <>
              <a className="sb-button-secondary" href="/login">
                Sign in
              </a>
              <a className="sb-button" href="/signup">
                Create account
              </a>
            </>
          )}
        </div>
      </nav>

      <section className="sb-hero">
        <div>
          <p className="sb-eyebrow">Public home</p>
          <h1>Stripe, Supabase, and AI in one production-safe dashboard.</h1>
          <p className="sb-copy">
            The homepage stays public. Sign in to access the protected dashboard.
          </p>
        </div>
        <div className="sb-card">
          <p className="sb-eyebrow">Auth section</p>
          <h2>{user ? "You are signed in." : "Sign in or create an account."}</h2>
          <p>
            {user
              ? `Signed in as ${user.email || "unknown"}.`
              : "Use the sign in or sign up pages to create a persistent Supabase session."}
          </p>
          <div className="sb-inline-actions">
            {user ? (
              <a className="sb-button" href="/dashboard">
                Open dashboard
              </a>
            ) : (
              <>
                <a className="sb-button" href="/login">
                  Sign in
                </a>
                <a className="sb-button-secondary" href="/signup">
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
