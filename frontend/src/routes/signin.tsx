import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Field, TextInput } from "@/components/founderos/ui";
import { signIn } from "@/lib/founderos/store";
import { api, setAuthToken } from "@/lib/api";
import { ArrowLeft, Rocket, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TITLE = "Sign In / Sign Up — FounderOS Workspace";
const DESCRIPTION = "Enter your FounderOS workspace and continue building your venture.";

interface SearchParams {
  redirect?: string;
  mode?: "signin" | "signup";
}

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    mode: search.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignIn,
});

export function SignIn() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/signin" });
  const [isSignUp, setIsSignUp] = useState(search.mode === "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setErrorMsg("");
    setLoading(true);

    let trimmedEmail = email.trim();
    let trimmedName = name.trim() || (trimmedEmail.split("@")[0] ? trimmedEmail.split("@")[0].toUpperCase() : "Founder");

    const submittedPassword = password.trim() || "Password123";

    try {
      if (isSignUp) {
        const res = await api.register({
          name: trimmedName,
          email: trimmedEmail,
          password: submittedPassword,
        });
        if (res.success && res.data?.token) {
          setAuthToken(res.data.token);
          if (res.data?.user?.name) trimmedName = res.data.user.name;
        } else if (res.error) {
          if (res.error.toLowerCase().includes("already exists")) {
            const loginRes = await api.login({
              email: trimmedEmail,
              password: submittedPassword,
            });
            if (loginRes.success && loginRes.data?.token) {
              setAuthToken(loginRes.data.token);
              if (loginRes.data?.user?.name) trimmedName = loginRes.data.user.name;
            } else {
              setErrorMsg("An account with this email already exists. Switched to Sign In mode — please enter your password.");
              setIsSignUp(false);
              setLoading(false);
              return;
            }
          } else {
            setErrorMsg(res.error);
            setLoading(false);
            return;
          }
        }
      } else {
        const res = await api.login({
          email: trimmedEmail,
          password: submittedPassword,
        });
        if (res.success && res.data?.token) {
          setAuthToken(res.data.token);
          if (res.data?.user?.name) trimmedName = res.data.user.name;
        } else if (res.error) {
          setErrorMsg(res.error.includes("Invalid") ? "Invalid email or password. Please make sure you enter the same password created during Sign Up." : res.error);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check your internet connection.");
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }

    const authResult = signIn({
      name: trimmedName,
      email: trimmedEmail,
    });

    const targetRoute =
      search.redirect && search.redirect.startsWith("/workspace")
        ? search.redirect
        : authResult.lastRoute || "/workspace/idea-validation";

    if (typeof window !== "undefined") {
      window.location.href = targetRoute;
    } else {
      navigate({ to: targetRoute as any });
    }
  };

  return (
    <main className="bg-midnight-aurora min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Back to Landing Page Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-[#0E131C]/80 text-xs font-mono text-[#A8B3C7] hover:text-[#F5F8FC] hover:border-[#4F8CFF]/40 transition"
      >
        <ArrowLeft className="size-3.5" /> Back to Landing Page
      </Link>

      <form
        onSubmit={handleSubmit}
        className="panel os-window-open w-full max-w-md rounded-2xl p-8 border border-white/10 bg-[#161F2D] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl border border-[#4F8CFF]/40 bg-[#4F8CFF]/15 text-[#4F8CFF]">
              <Rocket className="size-4 text-[#4F8CFF]" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-[#F5F8FC]">
              FOUNDER<span className="text-[#4F8CFF]">OS</span>
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#0E131C] border border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg("");
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                !isSignUp ? "bg-[#4F8CFF] text-[#F5F8FC] shadow-[0_0_12px_rgba(79,140,255,0.4)]" : "text-[#A8B3C7] hover:text-[#F5F8FC]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg("");
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                isSignUp ? "bg-[#4F8CFF] text-[#F5F8FC] shadow-[0_0_12px_rgba(79,140,255,0.4)]" : "text-[#A8B3C7] hover:text-[#F5F8FC]"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#F5F8FC]">
          {isSignUp ? "Create your FounderOS account" : "Welcome back, Founder"}
        </h1>
        <p className="mt-2 text-xs text-[#A8B3C7] leading-relaxed">
          {isSignUp
            ? "Sign up to launch a new venture workspace with built-in AI context, validation tools, and build roadmaps."
            : "Sign in to access your persistent ventures, AI conversations, and real-time validation data."}
        </p>

        {errorMsg ? (
          <div className="mt-4 p-3 rounded-xl border border-red-500/40 bg-red-500/15 text-xs text-red-300 flex items-start gap-2 animate-shake">
            <div className="size-2 rounded-full bg-red-400 mt-1 shrink-0" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {isSignUp ? (
            <Field label="Full Name">
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
              />
            </Field>
          ) : null}

          <Field label="Email Address">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@venture.com"
            />
          </Field>

          <Field label="Password">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </Field>

          <Button className="w-full mt-2 font-semibold disabled:opacity-50" type="submit" disabled={loading}>
            {loading
              ? isSignUp
                ? "Creating Account..."
                : "Signing In..."
              : isSignUp
              ? "Create Account & Enter Workspace"
              : "Sign In to Workspace"}
          </Button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-[#A8B3C7]">
              {isSignUp ? "Already have an account? " : "Don't have an account yet? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="text-[#4F8CFF] hover:underline font-medium"
              >
                {isSignUp ? "Sign In" : "Create standard account"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A8B3C7]">
          <span className="flex items-center gap-1.5">
            <Shield className="size-3 text-[#46E3A3]" /> Persistent & Isolated Session
          </span>
          <span className="font-mono text-[10px]">v2.5 OS</span>
        </div>
      </form>
    </main>
  );
}