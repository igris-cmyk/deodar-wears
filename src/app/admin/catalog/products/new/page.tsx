import { ProductEditorForm } from "@/components/admin/catalog/product-editor-form";
import { PageHeader } from "@/components/ui/primitives";
import { requireAdminPagePermission } from "@/modules/admin/admin-page-auth";
import { createProductAction } from "@/modules/catalog/catalog.actions";
import { getProductEditorData } from "@/modules/catalog/catalog.queries";

export default async function NewProductPage() {
  await requireAdminPagePermission("catalog.products.create");
  const data = await getProductEditorData();

  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Catalog" title="New product">
        Create a product with media, variants, price, inventory and merchandising
        relationships.
      </PageHeader>
      <ProductEditorForm
        action={createProductAction}
        categories={data.categories}
        collections={data.collections}
        product={null}
      />
    </section>
  );
}
