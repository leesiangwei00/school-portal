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
import { ApiError, createClass, getClass, getTeachers, updateClass } from "@/lib/api";
import { CLASS_LEVELS } from "@/lib/constants";
import type { Teacher } from "@/lib/types";
import { validateRequired } from "@/lib/validation";

const emptyForm = { level: "", name: "", teacherEmail: "" };

type FormField = keyof typeof emptyForm;

function validateField(field: FormField, value: string): string | null {
  switch (field) {
    case "level":
      return validateRequired(value, "Class level");
    case "name":
      return validateRequired(value, "Class name");
    case "teacherEmail":
      return validateRequired(value, "Form teacher");
  }
}

export function AddClassPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FormField, string | null>>>({});
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    getTeachers()
      .then((res) => setTeachers(res.data))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load teachers.");
      });
  }, []);

  useEffect(() => {
    if (!id) return;
    getClass(id)
      .then((cls) =>
        setForm({ level: cls.level, name: cls.name, teacherEmail: cls.formTeacher.email }),
      )
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load class.");
        navigate("/classes");
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
      if (id) {
        await updateClass(id, form);
      } else {
        await createClass(form);
        toast.success(`"${form.name}" was added.`);
      }
      navigate("/classes");
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
      <h1 className="mb-6 text-2xl font-semibold">{isEditing ? "Edit Class" : "Add Class"}</h1>

      <Card className="p-6">
        <form id="add-class-form" onSubmit={handleSubmit} noValidate className="max-w-sm space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="level">Class Level</Label>
            <Select
              value={form.level}
              onValueChange={(value) => handleSelectChange("level", value)}
            >
              <SelectTrigger id="level" className="w-full" aria-invalid={Boolean(errors.level)}>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && <p className="text-xs text-destructive">{errors.level}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="Class Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="teacherEmail">Form Teacher</Label>
            <Select
              value={form.teacherEmail}
              onValueChange={(value) => handleSelectChange("teacherEmail", value)}
              disabled={teachers.length === 0}
            >
              <SelectTrigger
                id="teacherEmail"
                className="w-full"
                aria-invalid={Boolean(errors.teacherEmail)}
              >
                <SelectValue placeholder="Assign a form teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.email} value={teacher.email}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {teachers.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No existing teachers.{" "}
                <Link to="/teachers/new" className="text-primary underline underline-offset-2">
                  Add a teacher
                </Link>
              </p>
            ) : (
              errors.teacherEmail && (
                <p className="text-xs text-destructive">{errors.teacherEmail}</p>
              )
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
          <Link to="/classes">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <Button type="submit" form="add-class-form" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Save Changes" : "Add Class"}
        </Button>
      </div>
    </div>
  );
}
