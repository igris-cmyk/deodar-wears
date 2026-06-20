import { Button, Input, PageHeader, Select, Textarea } from "@/components/ui/primitives";
import { requireAdminPagePermission } from "@/modules/admin/admin-page-auth";
import { adjustInventoryAction } from "@/modules/catalog/catalog.actions";
import { calculateAvailableQuantity } from "@/modules/catalog/catalog.helpers";
import { getInventoryAdminData } from "@/modules/inventory/inventory.service";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPagePermission("inventory.read");
  const params = await searchParams;
  const data = await getInventoryAdminData({
    q: firstParam(params.q),
    page: Number(firstParam(params.page) ?? 1),
  });

  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Inventory" title="Stock control">
        Adjust quantity on hand with required reason, transaction safety and audit
        history.
      </PageHeader>
      <form className="grid gap-3 border-y border-[var(--border)] py-4 md:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="inventory-q">
          Search SKU or product
        </label>
        <Input
          id="inventory-q"
          name="q"
          defaultValue={firstParam(params.q) ?? ""}
          placeholder="Search SKU, variant or product"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="grid gap-5">
        {data.items.map((item) => {
          const available = calculateAvailableQuantity(item);
          const reorder = item.trackInventory && available <= item.reorderThreshold;

          return (
            <section
              className="grid gap-5 border-y border-[var(--border)] py-5"
              key={item.id}
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr] lg:items-start">
                <div>
                  <p className="utility text-[var(--foreground-muted)]">
                    {item.variant.sku}
                  </p>
                  <h2 className="heading-3 mt-1">{item.variant.product.name}</h2>
                  <p className="body-s text-[var(--foreground-muted)]">
                    {item.variant.title}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <Metric label="On hand" value={item.quantityOnHand} />
                  <Metric label="Reserved" value={item.quantityReserved} />
                  <Metric label="Available" value={available} />
                  <Metric label="Reorder" value={reorder ? "Yes" : "No"} />
                </dl>
              </div>

              <form action={adjustInventoryAction} className="grid gap-3 lg:grid-cols-[160px_140px_1fr_auto]">
                <input type="hidden" name="inventoryItemId" value={item.id} />
                <Select name="type" defaultValue="MANUAL" aria-label="Adjustment type">
                  <option value="RECEIPT">Receipt</option>
                  <option value="CORRECTION">Correction</option>
                  <option value="DAMAGE">Damage</option>
                  <option value="RETURN">Return</option>
                  <option value="MANUAL">Manual</option>
                </Select>
                <Input
                  name="quantityDelta"
                  required
                  inputMode="numeric"
                  placeholder="+5 or -2"
                  aria-label="Quantity delta"
                />
                <Textarea
                  name="reason"
                  required
                  placeholder="Reason for stock adjustment"
                  aria-label="Adjustment reason"
                  className="min-h-11"
                />
                <Button type="submit">Adjust</Button>
              </form>

              <div className="grid gap-2">
                <p className="label text-[var(--foreground-muted)]">Recent history</p>
                {item.adjustments.length ? (
                  <ul className="grid gap-2">
                    {item.adjustments.map((adjustment) => (
                      <li className="body-s text-[var(--foreground-muted)]" key={adjustment.id}>
                        {adjustment.type} {adjustment.quantityDelta > 0 ? "+" : ""}
                        {adjustment.quantityDelta}: {adjustment.previousQuantity} to{" "}
                        {adjustment.resultingQuantity} · {adjustment.reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="body-s text-[var(--foreground-muted)]">
                    No adjustment history recorded yet.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-[var(--border)] p-3">
      <dt className="utility text-[var(--foreground-muted)]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">{value}</dd>
    </div>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
