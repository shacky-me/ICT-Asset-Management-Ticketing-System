import Link from "next/link";

export default function ActivatePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Account Activation</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your account activation link is being verified. If your token is
          valid, you can proceed to sign in.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
