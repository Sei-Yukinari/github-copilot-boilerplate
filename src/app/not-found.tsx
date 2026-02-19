import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6">
      <h2 className="text-xl font-bold text-slate-800">
        ページが見つかりません
      </h2>
      <p className="text-sm text-slate-500">
        お探しのページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="rounded bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        トップページに戻る
      </Link>
    </div>
  );
}
