import { Button, Input, PageHeader, Textarea } from "@/components/ui/primitives";
import { requireAdminPagePermission } from "@/modules/admin/admin-page-auth";
import { upsertCollectionAction } from "@/modules/catalog/catalog.actions";
import { getCollectionAdminData } from "@/modules/catalog/catalog.queries";

export default async function AdminCollectionsPage() {
  await requireAdminPagePermission("catalog.collections.manage");
  const collections = await getCollectionAdminData();

  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Catalog" title="Collections">
        Collections are merchandising groups such as new arrivals and seasonal edits.
      </PageHeader>
      <CollectionForm />
      <div className="grid gap-4">
        {collections.map((collection) => (
          <CollectionForm collection={collection} key={collection.id} />
        ))}
      </div>
    </section>
  );
}

function CollectionForm({
  collection,
}: {
  collection?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    active: boolean;
    featured: boolean;
    sortOrder: number;
  };
}) {
  return (
    <form
      action={upsertCollectionAction}
      className="grid gap-4 border-y border-[var(--border)] py-5"
    >
      <input type="hidden" name="id" value={collection?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_140px]">
        <label className="grid gap-2 text-sm font-semibold">
          Name
          <Input name="name" required defaultValue={collection?.name ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Slug
          <Input name="slug" required defaultValue={collection?.slug ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Sort
          <Input
            name="sortOrder"
            required
            inputMode="numeric"
            defaultValue={collection?.sortOrder ?? 50}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        Description
        <Textarea
          name="description"
          required
          defaultValue={collection?.description ?? ""}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            className="size-5 accent-[var(--brand)]"
            type="checkbox"
            name="active"
            defaultChecked={collection?.active ?? true}
          />
          Active
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            className="size-5 accent-[var(--brand)]"
            type="checkbox"
            name="featured"
            defaultChecked={collection?.featured ?? false}
          />
          Featured
        </label>
        <Button type="submit">
          {collection ? "Save collection" : "Create collection"}
        </Button>
      </div>
    </form>
  );
}
