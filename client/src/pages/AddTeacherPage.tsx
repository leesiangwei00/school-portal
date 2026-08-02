import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, createTeacher, getTeacher, updateTeacher } from "@/lib/api";
import { SUBJECTS } from "@/lib/constants";
import {
  formatContactNumber,
  stripContactNumber,
  validateContactNumber,
  validateEmail,
  validateRequired,
} from "@/lib/validation";

const emptyForm = { name: "", subject: "", email: "", contactNumber: "" };

type FormField = keyof typeof emptyForm;

function validateField(field: FormField, value: string): string | null {
  switch (field) {
    case "name":
      return validateRequired(value, "Name");
    case "subject":
      return validateRequired(value, "Subject");
    case "email":
      return validateEmail(value);
    case "contactNumber":
      return validateContactNumber(value);
  }
}

export function AddTeacherPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FormField, string | null>>>({});
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!id) return;
    getTeacher(id)
      .then((teacher) => setForm({ ...teacher }))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load teacher.");
        navigate("/teachers");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  function handleChange(field: FormField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function handleBlur(field: FormField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  }

  // Selects finalize their value in one step, so validate the new value directly
  // instead of handleChange + handleBlur, which would validate against stale form state.
  function handleSelectChange(field: FormField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fields = Object.keys(emptyForm) as FormField[];
    const nextErrors = Object.fromEntries(
      fields.map((field) => [field, validateField(field, form[field])]),
    );
    setErrors(nextErrors);
    setTouched(Object.fromEntries(fields.map((field) => [field, true])));
    if (Object.values(nextErrors).some(Boolean)) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const input = { ...form, contactNumber: stripContactNumber(form.contactNumber) };
      if (id) {
        await updateTeacher(id, input);
      } else {
        await createTeacher(input);
        toast.success(`"${input.name}" was added.`);
      }
      navigate("/teachers");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">{isEditing ? "Edit Teacher" : "Add Teacher"}</h1>

      <Card className="p-6">
        <form id="add-teacher-form" onSubmit={handleSubmit} noValidate className="max-w-sm space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={form.subject}
              onValueChange={(value) => handleSelectChange("subject", value)}
            >
              <SelectTrigger id="subject" className="w-full" aria-invalid={Boolean(errors.subject)}>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contactNumber">Work Contact Number</Label>
            <Input
              id="contactNumber"
              placeholder="9123 4567"
              inputMode="numeric"
              value={formatContactNumber(form.contactNumber)}
              onChange={(e) => handleChange("contactNumber", stripContactNumber(e.target.value).slice(0, 8))}
              onBlur={() => handleBlur("contactNumber")}
              aria-invalid={Boolean(errors.contactNumber)}
            />
            {errors.contactNumber && (
              <p className="text-xs text-destructive">{errors.contactNumber}</p>
            )}
          </div>

          {formError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
        </form>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link to="/teachers">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <Button type="submit" form="add-teacher-form" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Save Changes" : "Add Teacher"}
        </Button>
      </div>
    </div>
  );
}
