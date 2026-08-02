import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, deleteClass, getClasses } from "@/lib/api";
import type { SchoolClass } from "@/lib/types";

export function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<SchoolClass | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getClasses()
      .then((res) => setClasses(res.data))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load classes.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteClass(pendingDelete.id);
      setClasses((prev) => prev.filter((cls) => cls.id !== pendingDelete.id));
      toast.success(`"${pendingDelete.name}" was deleted.`);
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete class.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classes</h1>
        {!loading && classes.length > 0 && (
          <Button asChild>
            <Link to="/classes/new">
              <Plus />
              Add Class
            </Link>
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</p>
        ) : classes.length === 0 ? (
          <EmptyState message="There are no existing classes yet.">
            <Button asChild>
              <Link to="/classes/new">
                <Plus />
                Add Class
              </Link>
            </Button>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Class Level</TableHead>
                <TableHead>Class Name</TableHead>
                <TableHead>Form Teacher</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((schoolClass, index) => (
                <TableRow key={schoolClass.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{schoolClass.level}</TableCell>
                  <TableCell>{schoolClass.name}</TableCell>
                  <TableCell>{schoolClass.formTeacher.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          to={`/classes/${schoolClass.id}/edit`}
                          aria-label={`Edit ${schoolClass.name}`}
                        >
                          <Pencil />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${schoolClass.name}`}
                        onClick={() => setPendingDelete(schoolClass)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete class?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{pendingDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
