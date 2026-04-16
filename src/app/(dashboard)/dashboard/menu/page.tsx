"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { compressImage, IMAGE_PRESETS } from "@/lib/compress-image";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, ImagePlus, X } from "lucide-react";
import Image from "next/image";

type Category = {
  _id: Id<"categories">;
  name: string;
  position: number;
};

type Dish = {
  _id: Id<"dishes">;
  categoryId: Id<"categories">;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  position: number;
  imageId?: Id<"_storage">;
  imageUrl?: string | null;
};

export default function MenuPage() {
  const restaurant = useQuery(api.restaurants.getCurrent);
  const categories = useQuery(
    api.categories.list,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );
  const dishes = useQuery(
    api.dishes.listByRestaurant,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);
  const createDish = useMutation(api.dishes.create);
  const updateDish = useMutation(api.dishes.update);
  const removeDish = useMutation(api.dishes.remove);
  const generateUploadUrl = useMutation(api.dishes.generateUploadUrl);

  const [catModal, setCatModal] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [catName, setCatName] = useState("");

  const [dishModal, setDishModal] = useState<{
    open: boolean;
    categoryId?: Id<"categories">;
    editing?: Dish;
  }>({ open: false });
  const [dishForm, setDishForm] = useState({ name: "", description: "", price: "" });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddCategory = () => { setCatName(""); setCatModal({ open: true }); };
  const openEditCategory = (cat: Category) => { setCatName(cat.name); setCatModal({ open: true, editing: cat }); };

  const saveCategory = async () => {
    if (!catName.trim()) return;
    try {
      if (catModal.editing) {
        await updateCategory({ id: catModal.editing._id, name: catName.trim() });
        toast.success("Catégorie modifiée");
      } else {
        await createCategory({ name: catName.trim() });
        toast.success("Catégorie créée");
      }
      setCatModal({ open: false });
    } catch { toast.error("Une erreur est survenue"); }
  };

  const deleteCategory = async (id: Id<"categories">) => {
    try {
      await removeCategory({ id });
      toast.success("Catégorie supprimée");
    } catch { toast.error("Une erreur est survenue"); }
  };

  const openAddDish = (categoryId: Id<"categories">) => {
    setDishForm({ name: "", description: "", price: "" });
    resetImageState();
    setDishModal({ open: true, categoryId });
  };

  const openEditDish = (dish: Dish) => {
    setDishForm({ name: dish.name, description: dish.description ?? "", price: String(dish.price) });
    resetImageState();
    setImagePreview(dish.imageUrl ?? null);
    setDishModal({ open: true, editing: dish });
  };

  const saveDish = async () => {
    if (!dishForm.name.trim() || !dishForm.price) return;
    const price = parseInt(dishForm.price, 10);
    if (isNaN(price) || price <= 0) { toast.error("Prix invalide"); return; }
    setUploading(true);
    try {
      let newImageId: Id<"_storage"> | undefined = undefined;
      if (imageFile) {
        const compressed = await compressImage(
          imageFile,
          IMAGE_PRESETS.dish.maxWidth,
          IMAGE_PRESETS.dish.maxHeight,
          IMAGE_PRESETS.dish.quality
        );
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": compressed.type }, body: compressed });
        if (!res.ok) throw new Error("Upload échoué");
        const { storageId } = await res.json() as { storageId: Id<"_storage"> };
        newImageId = storageId;
      }
      if (dishModal.editing) {
        const imageId = imageFile ? newImageId : removeImage ? undefined : dishModal.editing.imageId;
        await updateDish({ id: dishModal.editing._id, name: dishForm.name.trim(), description: dishForm.description || undefined, price, available: dishModal.editing.available, imageId });
        toast.success("Plat modifié");
      } else if (dishModal.categoryId) {
        await createDish({ categoryId: dishModal.categoryId, name: dishForm.name.trim(), description: dishForm.description || undefined, price, imageId: newImageId });
        toast.success("Plat ajouté");
      }
      setDishModal({ open: false });
    } catch { toast.error("Une erreur est survenue"); }
    finally { setUploading(false); }
  };

  const toggleAvailability = async (dish: Dish) => {
    await updateDish({ id: dish._id, name: dish.name, description: dish.description, price: dish.price, available: !dish.available, imageId: dish.imageId });
  };

  const deleteDish = async (id: Id<"dishes">) => {
    await removeDish({ id });
    toast.success("Plat supprimé");
  };

  const getCategoryDishes = (categoryId: Id<"categories">) =>
    (dishes ?? []).filter((d) => d.categoryId === categoryId);

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Menu"
        description="Gérez vos catégories et plats"
        actions={
          <Button
            onClick={openAddCategory}
            className="rounded-full bg-uber-black text-white font-bold text-micro sm:text-caption px-3 sm:px-5 hover:bg-body-gray"
          >
            <Plus size={14} className="mr-1" aria-hidden="true" />
            <span className="hidden sm:inline">Catégorie</span>
            <span className="sm:hidden">Cat.</span>
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-3 animate-fade-in-up">
        {categories?.length === 0 && (
          <div className="card-whisper p-8 sm:p-12 text-center">
            <p className="text-body text-muted-gray mb-4">Aucune catégorie pour l&apos;instant.</p>
            <Button onClick={openAddCategory} className="rounded-full bg-uber-black text-white font-bold px-6 hover:bg-body-gray">
              <Plus size={14} className="mr-1.5" aria-hidden="true" />
              Ajouter une catégorie
            </Button>
          </div>
        )}

        {categories?.map((cat) => {
          const catDishes = getCategoryDishes(cat._id);
          const isOpen = expanded.has(cat._id);
          return (
            <div key={cat._id} className="card-whisper overflow-hidden">
              {/* Category row */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                <button
                  onClick={() => toggleExpanded(cat._id)}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Réduire" : "Développer"} la catégorie ${cat.name}`}
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  {isOpen ? <ChevronUp size={16} className="text-muted-gray shrink-0" /> : <ChevronDown size={16} className="text-muted-gray shrink-0" />}
                  <span className="text-caption font-semibold text-uber-black truncate">{cat.name}</span>
                  <span className="text-micro text-muted-gray shrink-0">{catDishes.length} plat{catDishes.length > 1 ? "s" : ""}</span>
                </button>
                <div className="flex items-center gap-1 sm:gap-2 ml-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openAddDish(cat._id)}
                    className="rounded-full text-micro h-8 px-2 sm:px-3 text-body-gray hover:text-uber-black hover:bg-chip-gray">
                    <Plus size={13} aria-hidden="true" />
                    <span className="hidden sm:inline ml-1">Plat</span>
                  </Button>
                  <button onClick={() => openEditCategory(cat)} aria-label={`Modifier ${cat.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-chip-gray text-muted-gray hover:text-uber-black transition-colors">
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button onClick={() => deleteCategory(cat._id)} aria-label={`Supprimer ${cat.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-muted-gray hover:text-red-600 transition-colors">
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Dishes list — CSS grid trick for smooth height animation */}
              <div
                className="grid transition-[grid-template-rows] duration-[240ms] ease-[cubic-bezier(.645,.045,.355,1)]"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
              <div className="overflow-hidden">
              {/* inner wrapper needed for grid trick */}
              <div className="border-t border-border divide-y divide-border">
                  {catDishes.length === 0 && (
                    <div className="px-6 py-5 text-center">
                      <p className="text-micro text-muted-gray">Aucun plat dans cette catégorie.</p>
                    </div>
                  )}
                  {catDishes.map((dish, i) => (
                    <div
                      key={dish._id}
                      className="px-4 sm:px-6 py-3 hover:bg-hover-light transition-[background-color] duration-[150ms] ease animate-fade-in-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Mobile: stacked layout */}
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        {dish.imageUrl ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg mt-0.5">
                            <Image src={dish.imageUrl} alt={dish.name} fill sizes="40px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-chip-gray mt-0.5" />
                        )}

                        <div className="flex-1 min-w-0">
                          {/* Name row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-caption font-medium text-uber-black">{dish.name}</span>
                            {!dish.available && (
                              <Badge variant="secondary" className="text-[10px] rounded-full shrink-0">Indispo</Badge>
                            )}
                          </div>
                          {dish.description && (
                            <p className="text-micro text-muted-gray mt-0.5 line-clamp-1">{dish.description}</p>
                          )}

                          {/* Actions row */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-caption font-semibold text-uber-black">{formatPrice(dish.price)}</span>
                            <button
                              onClick={() => toggleAvailability(dish)}
                              className={`text-micro rounded-full px-2.5 py-1 font-medium transition-colors ${
                                dish.available ? "bg-chip-gray text-body-gray hover:bg-hover-gray" : "bg-uber-black text-white hover:bg-body-gray"
                              }`}
                            >
                              {dish.available ? "Dispo" : "Remettre dispo"}
                            </button>
                            <button onClick={() => openEditDish(dish)} aria-label={`Modifier ${dish.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-chip-gray text-muted-gray hover:text-uber-black transition-colors">
                              <Pencil size={12} aria-hidden="true" />
                            </button>
                            <button onClick={() => deleteDish(dish._id)} aria-label={`Supprimer ${dish.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-50 text-muted-gray hover:text-red-600 transition-colors">
                              <Trash2 size={12} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      <Dialog open={catModal.open} onOpenChange={(o) => setCatModal({ open: o })}>
        <DialogContent className="rounded-[var(--radius-xl)] max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px] font-bold">
              {catModal.editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">Nom de la catégorie</Label>
              <Input placeholder="Ex : Entrées, Plats, Desserts…" value={catName}
                onChange={(e) => setCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCategory()}
                className="input-zeat" autoFocus />
            </div>
            <Button onClick={saveCategory} className="w-full rounded-full bg-uber-black text-white font-bold hover:bg-body-gray">
              {catModal.editing ? "Enregistrer" : "Créer la catégorie"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dish Modal */}
      <Dialog open={dishModal.open} onOpenChange={(o) => { if (!uploading) setDishModal({ open: o }); }}>
        <DialogContent className="rounded-[var(--radius-xl)] max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px] font-bold">
              {dishModal.editing ? "Modifier le plat" : "Nouveau plat"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Image upload */}
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">
                Photo <span className="text-muted-gray">(optionnel)</span>
              </Label>
              {imagePreview ? (
                <div className="relative h-36 w-full overflow-hidden rounded-[var(--radius-lg)]">
                  <Image src={imagePreview} alt="Aperçu" fill sizes="384px" className="object-cover" />
                  <button type="button" onClick={clearImage} aria-label="Supprimer la photo"
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                    <X size={13} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-border hover:border-uber-black transition-colors text-muted-gray hover:text-uber-black">
                  <ImagePlus size={20} aria-hidden="true" />
                  <span className="text-micro font-medium">Ajouter une photo</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} aria-label="Choisir une photo" />
              {imagePreview && !imageFile && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-micro text-body-gray hover:text-uber-black underline underline-offset-2">
                  Changer la photo
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-caption font-medium">Nom du plat</Label>
              <Input placeholder="Ex : Thiéboudienne" value={dishForm.name}
                onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                className="input-zeat" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">
                Description <span className="text-muted-gray">(optionnel)</span>
              </Label>
              <Input placeholder="Courte description du plat…" value={dishForm.description}
                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                className="input-zeat" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">Prix (FCFA)</Label>
              <Input type="number" placeholder="Ex : 2500" value={dishForm.price}
                onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                className="input-zeat" min={0} />
            </div>
            <Button onClick={saveDish} disabled={uploading}
              className="w-full rounded-full bg-uber-black text-white font-bold hover:bg-body-gray">
              {uploading ? "Envoi en cours…" : dishModal.editing ? "Enregistrer" : "Ajouter le plat"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
