import {
  Checkbox,
  Field,
  FieldDescription,
  PageHeader,
} from "@/components/ui/primitives";

export default function AccountPreferencesPage() {
  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Account" title="Preferences">
        Marketing consent is explicit and separate from transactional communication.
      </PageHeader>
      <form className="grid max-w-xl gap-5">
        <Field>
          <label className="flex gap-3">
            <Checkbox name="marketingEmail" />
            <span>Marketing email</span>
          </label>
          <FieldDescription>
            Optional updates about future Deodar Wears releases.
          </FieldDescription>
        </Field>
        <Field>
          <label className="flex gap-3">
            <Checkbox name="marketingSms" />
            <span>Marketing SMS</span>
          </label>
          <FieldDescription>
            Transactional messages cannot be disabled where needed for orders.
          </FieldDescription>
        </Field>
      </form>
    </section>
  );
}
