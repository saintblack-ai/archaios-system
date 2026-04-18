import { AuthForm } from "../components/AuthForm";

export default function SignupPage() {
  return (
    <main className="sb-shell">
      <div className="sb-nav">
        <div>
          <div className="sb-brand">Saint Black Command</div>
          <div className="sb-status">Public sign-up page</div>
        </div>
        <a className="sb-button-secondary" href="/">
          Home
        </a>
      </div>
      <AuthForm mode="signup" />
    </main>
  );
}
