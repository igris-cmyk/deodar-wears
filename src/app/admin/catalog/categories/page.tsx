import { Button, Input, PageHeader, Textarea } from "@/components/ui/primitives";
import { requireAdminPagePermission } from "@/modules/admin/admin-page-auth";
import { upsertCategoryAction } from "@/modules/catalog/catalog.actions";
import { getCategoryAdminData } from "@/modules/catalog/catalog.queries";

export default async function AdminCategoriesPage() {
  await requireAdminPagePermission("catalog.categories.manage");
  const categories = await getCategoryAdminData();

  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Catalog" title="Categories">
        Categories describe product type and primary browsing structure.
      </PageHeader>
      <CategoryForm />
      <div className="grid gap-4">
        {categories.map((category) => (
          <CategoryForm category={category} key={category.id} />
        ))}
      </div>
    </section>
  );
}

function CategoryForm({
  category,
}: {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    active: boolean;
    sortOrder: number;
  };
}) {
  return (
    <form
      action={upsertCategoryAction}
      className="grid gap-4 border-y border-[var(--border)] py-5"
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_140px]">
        <label className="grid gap-2 text-sm font-semibold">
          Name
          <Input name="name" required defaultValue={category?.name ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Slug
          <Input name="slug" required defaultValue={category?.slug ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Sort
          <Input
            name="sortOrder"
            required
            inputMode="numeric"
            defaultValue={category?.sortOrder ?? 50}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        Description
        <Textarea
          name="description"
          required
          defaultValue={category?.description ?? ""}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            className="size-5 accent-[var(--brand)]"
            type="checkbox"
            name="active"
            defaultChecked={category?.active ?? true}
          />
          Active
        </label>
        <Button type="submit">{category ? "Save category" : "Create category"}</Button>
      </div>
    </form>
  );
}
