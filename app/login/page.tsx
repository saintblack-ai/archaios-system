import { AuthForm } from "../components/AuthForm";

export default function LoginPage() {
  return (
    <main className="sb-shell">
      <div className="sb-nav">
        <div>
          <div className="sb-brand">Saint Black Command</div>
          <div className="sb-status">Public sign-in page</div>
        </div>
        <a className="sb-button-secondary" href="/">
          Home
        </a>
      </div>
      <AuthForm mode="signin" />
    </main>
  );
}
