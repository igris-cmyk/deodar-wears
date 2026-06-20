import { Skeleton } from "@/components/ui/primitives";

export default function AdminProductsLoading() {
  return (
    <section className="grid gap-4">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </section>
  );
}
