import { Container, Skeleton } from "@/components/ui/primitives";

export default function ShopLoading() {
  return (
    <main id="main-content">
      <Container className="grid gap-6 py-10">
        <Skeleton />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </Container>
    </main>
  );
}
