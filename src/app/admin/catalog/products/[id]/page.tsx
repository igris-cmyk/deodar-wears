import { notFound } from "next/navigation";

import { ProductEditorForm } from "@/components/admin/catalog/product-editor-form";
import { Button, PageHeader } from "@/components/ui/primitives";
import { requireAdminPagePermission } from "@/modules/admin/admin-page-auth";
import {
  archiveProductAction,
  updateProductAction,
} from "@/modules/catalog/catalog.actions";
import { getProductEditorData } from "@/modules/catalog/catalog.queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  await requireAdminPagePermission("catalog.products.update");
  const { id } = await params;
  const data = await getProductEditorData(id);

  if (!data.product) notFound();

  const updateAction = updateProductAction.bind(null, data.product.id);
  const archiveAction = archiveProductAction.bind(null, data.product.id);

  return (
    <section className="grid gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader eyebrow="Catalog" title={data.product.name}>
          Edit product identity, media, variants, price, inventory and organization.
        </PageHeader>
        <form action={archiveAction}>
          <Button type="submit" variant="secondary">
            Archive product
          </Button>
        </form>
      </div>
      <ProductEditorForm
        action={updateAction}
        categories={data.categories}
        collections={data.collections}
        product={data.product}
      />
    </section>
  );
}
