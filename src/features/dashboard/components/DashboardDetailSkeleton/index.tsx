export default function DashboardDetailSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex animate-pulse items-center gap-3 px-2">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="h-6 w-48 rounded bg-gray-200" />
      </div>

      <section className="flex flex-col gap-6">
        <article className="h-96 animate-pulse rounded-[40px] bg-gray-200 p-6 lg:px-8 lg:py-6" />
      </section>
    </section>
  );
}
