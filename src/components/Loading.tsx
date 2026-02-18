export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
      <p className="text-sm text-slate-500">翻訳中...</p>
    </div>
  );
}
