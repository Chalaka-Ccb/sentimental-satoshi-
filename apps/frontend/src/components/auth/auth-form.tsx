'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { authSchema, type AuthErrors } from '@/lib/auth-schema';
import { useAuthStore } from '@/stores/authStore';

type AuthMode = 'login' | 'register';

type AuthFormProps = {
  mode: AuthMode;
};

const initialErrors: AuthErrors = {
  email: '',
  password: '',
};

function getUserIdFromToken(token: string) {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const [errors, setErrors] = useState<AuthErrors>(initialErrors);
  const [message, setMessage] = useState<string | null>(
    mode === 'login' && searchParams.get('registered') ? 'Registration complete. Log in to continue.' : null
  );
  const [pending, setPending] = useState(false);

  const heading = useMemo(() => (mode === 'login' ? 'Welcome back' : 'Create your account'), [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData) as Record<string, FormDataEntryValue>;
    const parsed = authSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] ?? '',
        password: fieldErrors.password?.[0] ?? '',
      });
      setMessage(null);
      return;
    }

    setPending(true);
    setErrors(initialErrors);
    setMessage(null);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, parsed.data);

      if (mode === 'login') {
        const userId = getUserIdFromToken(data.accessToken) ?? parsed.data.email;
        setTokens(data.accessToken, data.refreshToken);
        setUser({ id: userId, email: parsed.data.email });
        router.push('/dashboard');
        return;
      }

      setMessage('Account created. Redirecting to login...');
      router.push('/auth/login?registered=1');
    } catch (error) {
      const responseMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setMessage(responseMessage);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-0px)] bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.2),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 shadow-[0_24px_120px_rgba(15,23,42,0.16)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white md:flex">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Sentimental Satoshi</p>
              <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
                Trade the signal, keep the noise out.
              </h1>
              <p className="mt-4 max-w-sm text-base leading-7 text-slate-300">
                Authenticate, persist your refresh token, and keep protected routes locked until the session is ready.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
              <p className="font-medium text-white">Flow</p>
              <p className="mt-2 leading-6">
                Register an account, log in, and let the store + interceptor handle token refresh automatically.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {mode === 'login' ? 'Login' : 'Register'}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{heading}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {mode === 'login'
                  ? 'Sign in to access your dashboard and watchlists.'
                  : 'Create your account to start tracking sentiment and signals.'}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
                {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 8 characters"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
                {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password}</p> : null}
              </div>

              {message ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Working...' : mode === 'login' ? 'Log in' : 'Create account'}
              </button>

              <p className="text-center text-sm text-slate-600">
                {mode === 'login' ? 'Need an account? ' : 'Already registered? '}
                <a
                  className="font-semibold text-slate-950 underline decoration-slate-400 underline-offset-4"
                  href={mode === 'login' ? '/auth/register' : '/auth/login'}
                >
                  {mode === 'login' ? 'Register' : 'Log in'}
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}