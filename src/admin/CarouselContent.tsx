import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminSidebar } from "@/admin/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CarouselItem = {
  id: number;
  title: string;
  description: string;
  date_from: string;
  date_to: string;
  category: string;
  picture_path: string | null;
  created_at: string;
};

type FormState = {
  title: string;
  description: string;
  date_from: string;
  date_to: string;
  category: string;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80";
const EMPTY_FORM: FormState = { title: "", description: "", date_from: "", date_to: "", category: "" };

function itemImageUrl(item: CarouselItem) {
  if (!item.picture_path) return FALLBACK_IMAGE;
  return `/${item.picture_path}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

async function fetchCarouselItems(): Promise<CarouselItem[]> {
  const res = await fetch("/api/carousel");
  if (!res.ok) throw new Error("Failed to load carousel items.");
  const data = await res.json();
  return data.items as CarouselItem[];
}

async function createCarouselItem(form: FormState, file: File | null): Promise<void> {
  const body = new FormData();
  body.append("title", form.title);
  body.append("description", form.description);
  body.append("date_from", form.date_from);
  body.append("date_to", form.date_to);
  body.append("category", form.category);
  if (file) body.append("picture", file);

  const res = await fetch("/api/admin/carousel", { method: "POST", body, credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to create item.");
  }
}

async function updateCarouselItem(id: number, form: Partial<FormState>, file: File | null): Promise<void> {
  const body = new FormData();
  if (form.title !== undefined) body.append("title", form.title);
  if (form.description !== undefined) body.append("description", form.description);
  if (form.date_from !== undefined) body.append("date_from", form.date_from);
  if (form.date_to !== undefined) body.append("date_to", form.date_to);
  if (form.category !== undefined) body.append("category", form.category);
  if (file) body.append("picture", file);

  const res = await fetch(`/api/admin/carousel/${id}`, { method: "PATCH", body, credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to update item.");
  }
}

async function deleteCarouselItem(id: number): Promise<void> {
  const res = await fetch(`/api/admin/carousel/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to delete item.");
  }
}

function CarouselFormDialog({
  open,
  onOpenChange,
  initial,
  existingImageUrl,
  onSubmit,
  isSubmitting,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: FormState;
  existingImageUrl?: string | null;
  onSubmit: (form: FormState, file: File | null) => void;
  isSubmitting: boolean;
  title: string;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleOpen(v: boolean) {
    if (v) { setForm(initial); setFile(null); setPreview(null); }
    onOpenChange(v);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const displayImage = preview ?? existingImageUrl ?? null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row min-h-0">
          {/* Left: image panel */}
          <div className="sm:w-56 shrink-0 bg-muted border-b sm:border-b-0 sm:border-r flex flex-col">
            <div
              className="relative flex-1 min-h-[160px] sm:min-h-0 cursor-pointer group"
              onClick={() => fileRef.current?.click()}
            >
              {displayImage ? (
                <>
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImagePlus className="h-6 w-6 text-white" />
                    <span className="text-xs text-white font-medium">Change</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-xs font-medium">Upload cover</span>
                </div>
              )}
            </div>
            {displayImage && (
              <button
                type="button"
                className="py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors border-t w-full"
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              >
                Remove image
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Right: fields */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="cc-title">Title</Label>
                <Input id="cc-title" value={form.title} onChange={set("title")} placeholder="e.g. Advanced Life Support" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cc-category">Category</Label>
                <Input id="cc-category" value={form.category} onChange={set("category")} placeholder="e.g. Clinical Skills" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="cc-date-from">Date From</Label>
                  <Input id="cc-date-from" type="date" value={form.date_from} onChange={set("date_from")} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="cc-date-to">Date To</Label>
                  <Input id="cc-date-to" type="date" value={form.date_to} onChange={set("date_to")} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cc-description">Description</Label>
                <Textarea
                  id="cc-description"
                  value={form.description}
                  onChange={set("description")}
                  rows={5}
                  placeholder="Describe the training programme…"
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => handleOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={() => onSubmit(form, file)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCarouselContentPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<CarouselItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CarouselItem | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["carousel"],
    queryFn: fetchCarouselItems,
  });

  const createMutation = useMutation({
    mutationFn: ({ form, file }: { form: FormState; file: File | null }) => createCarouselItem(form, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carousel"] });
      setCreateOpen(false);
      toast.success("Carousel item created.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form, file }: { id: number; form: FormState; file: File | null }) =>
      updateCarouselItem(id, form, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carousel"] });
      setEditItem(null);
      toast.success("Carousel item updated.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCarouselItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carousel"] });
      setDeleteItem(null);
      toast.success("Carousel item deleted.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col pt-14 md:pl-72 md:pt-0">
        <header className="sticky top-14 z-10 md:top-0 border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content Management</p>
              <h1 className="font-display text-2xl font-bold tracking-tight">Carousel Content</h1>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Button>
          </div>
        </header>

        <div className="container mx-auto flex flex-1 flex-col py-8">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-24 text-center">
              <div>
                <p className="font-medium text-foreground">No carousel items yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Add your first item to display on the homepage.</p>
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add item
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-[3/2] overflow-hidden bg-muted">
                    <img
                      src={itemImageUrl(item)}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.date_from)} – {formatDate(item.date_to)}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditItem(item)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteItem(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-auto w-full border-t">
          <div className="container mx-auto py-4">
            <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Human Capital Department UNIKL Royal College Of Medicine Perak</p>
            <p className="text-center text-xs text-muted-foreground">All rights reserved.</p>
          </div>
        </footer>
      </div>

      <CarouselFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={EMPTY_FORM}
        existingImageUrl={null}
        title="Add Carousel Item"
        isSubmitting={createMutation.isPending}
        onSubmit={(form, file) => createMutation.mutate({ form, file })}
      />

      {editItem && (
        <CarouselFormDialog
          open={!!editItem}
          onOpenChange={(v) => { if (!v) setEditItem(null); }}
          initial={{
            title: editItem.title,
            description: editItem.description,
            date_from: editItem.date_from,
            date_to: editItem.date_to,
            category: editItem.category,
          }}
          existingImageUrl={itemImageUrl(editItem)}
          title="Edit Carousel Item"
          isSubmitting={updateMutation.isPending}
          onSubmit={(form, file) => updateMutation.mutate({ id: editItem.id, form, file })}
        />
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={(v) => { if (!v) setDeleteItem(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete carousel item?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteItem?.title}" will be removed from the homepage carousel. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
