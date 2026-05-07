import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full gap-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 shadow-[0_24px_120px_rgba(15,23,42,0.14)] backdrop-blur md:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">Sentimental Satoshi</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Track sentiment, conviction, and signal quality in one place.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Log in to access your dashboard, saved watchlists, and protected market views.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/auth/login"
              >
                Log in
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-950 hover:bg-slate-50"
                href="/auth/register"
              >
                Register
              </Link>
            </div>
          </div>

          <aside className="border-t border-slate-200 bg-slate-950 p-8 text-white md:border-l md:border-t-0 sm:p-10 lg:p-12">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Protected areas</p>
            <div className="mt-8 space-y-4 text-sm leading-6 text-slate-300">
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Dashboard heatmap and live signal stream</p>
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Symbol deep dive with conviction and charting</p>
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Saved watchlists and personalized tracking</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
