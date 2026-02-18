import { Loading } from '@/components/Loading';

export default function StoryLoading() {
  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200" />
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <Loading />
      </section>
    </div>
  );
}
