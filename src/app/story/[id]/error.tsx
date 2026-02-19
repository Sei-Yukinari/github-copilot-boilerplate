'use client';

export default function StoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6">
      <h2 className="text-xl font-bold text-slate-800">
        記事の読み込みに失敗しました
      </h2>
      <p className="text-sm text-slate-500">
        {error.message || 'しばらくしてからもう一度お試しください。'}
      </p>
      <button
        className="rounded bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        onClick={reset}
      >
        もう一度試す
      </button>
    </div>
  );
}
