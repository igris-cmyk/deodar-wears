import { Field, FieldLabel, Input, PageHeader } from "@/components/ui/primitives";

export default function AccountProfilePage() {
  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Account" title="Profile">
        Customer identity data is stored separately from future commerce records.
      </PageHeader>
      <form className="grid max-w-xl gap-5">
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" readOnly value="" />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" name="phone" readOnly value="" />
        </Field>
      </form>
    </section>
  );
}
