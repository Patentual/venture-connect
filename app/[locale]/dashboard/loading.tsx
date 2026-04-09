export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
        ))}
      </div>
    </div>
  );
}
