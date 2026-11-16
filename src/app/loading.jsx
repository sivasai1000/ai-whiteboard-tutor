export default function LoadingPage() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto flex min-h-96 max-w-3xl flex-col justify-center gap-5 px-8"
    >
      <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="h-16 w-4/5 animate-pulse rounded-xl bg-muted" />
      <div className="h-36 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
