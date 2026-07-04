import Link from "next/link";
import { verifyOtp } from "@/app/(auth)/actions";
import { Lock, ArrowRight } from "lucide-react";

export default async function VerifyPage(props: {
  searchParams: Promise<{ email?: string; message?: string }>;
}) {
  const searchParams = await props.searchParams;
  const email = searchParams?.email || '';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 lg:pl-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 mb-6">
            <div className="logo-mark-sm">
              <span>J</span>
            </div>
            <span className="logo-text text-2xl">jobbanai</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight heading-gradient mb-1">
            Check your email
          </h1>
          <p className="text-[var(--muted)] text-sm">
            We sent a verification code to {email}
          </p>
        </div>

        <form className="flex flex-col gap-4" action={verifyOtp}>
          <input type="hidden" name="email" value={email} />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="otp">
              Verification Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition-all text-sm placeholder:text-[var(--muted)] tracking-widest text-center"
                name="otp"
                id="otp"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>
          </div>

          {searchParams?.message && (
            <p className="p-3 bg-rose-500/10 text-rose-500 text-center text-sm rounded-lg border border-rose-500/20">
              {searchParams.message}
            </p>
          )}

          <button className="w-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all mt-2 flex items-center justify-center gap-2 text-sm active:scale-[0.98] shadow-lg shadow-[var(--gradient-mid)]/20">
            Verify and Log in
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
