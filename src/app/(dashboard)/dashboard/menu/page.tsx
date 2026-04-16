"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
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
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

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

  // Category modal
  const [catModal, setCatModal] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [catName, setCatName] = useState("");

  // Dish modal
  const [dishModal, setDishModal] = useState<{
    open: boolean;
    categoryId?: Id<"categories">;
    editing?: Dish;
  }>({ open: false });
  const [dishForm, setDishForm] = useState({ name: "", description: "", price: "" });

  // Expanded categories
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Category handlers ──
  const openAddCategory = () => {
    setCatName("");
    setCatModal({ open: true });
  };

  const openEditCategory = (cat: Category) => {
    setCatName(cat.name);
    setCatModal({ open: true, editing: cat });
  };

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
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const deleteCategory = async (id: Id<"categories">) => {
    try {
      await removeCategory({ id });
      toast.success("Catégorie supprimée");
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  // ── Dish handlers ──
  const openAddDish = (categoryId: Id<"categories">) => {
    setDishForm({ name: "", description: "", price: "" });
    setDishModal({ open: true, categoryId });
  };

  const openEditDish = (dish: Dish) => {
    setDishForm({
      name: dish.name,
      description: dish.description ?? "",
      price: String(dish.price),
    });
    setDishModal({ open: true, editing: dish });
  };

  const saveDish = async () => {
    if (!dishForm.name.trim() || !dishForm.price) return;
    const price = parseInt(dishForm.price, 10);
    if (isNaN(price) || price <= 0) {
      toast.error("Prix invalide");
      return;
    }
    try {
      if (dishModal.editing) {
        await updateDish({
          id: dishModal.editing._id,
          name: dishForm.name.trim(),
          description: dishForm.description || undefined,
          price,
          available: dishModal.editing.available,
        });
        toast.success("Plat modifié");
      } else if (dishModal.categoryId) {
        await createDish({
          categoryId: dishModal.categoryId,
          name: dishForm.name.trim(),
          description: dishForm.description || undefined,
          price,
        });
        toast.success("Plat ajouté");
      }
      setDishModal({ open: false });
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const toggleAvailability = async (dish: Dish) => {
    await updateDish({
      id: dish._id,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      available: !dish.available,
    });
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
            className="rounded-full bg-uber-black text-pure-white font-bold text-caption px-5 hover:bg-body-gray"
          >
            <Plus size={14} className="mr-1.5" />
            Catégorie
          </Button>
        }
      />

      <div className="p-8 space-y-3">
        {categories?.length === 0 && (
          <div className="card-whisper p-12 text-center">
            <p className="text-body text-muted-gray mb-4">Aucune catégorie pour l&apos;instant.</p>
            <Button
              onClick={openAddCategory}
              className="rounded-full bg-uber-black text-pure-white font-bold px-6 hover:bg-body-gray"
            >
              <Plus size={14} className="mr-1.5" />
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
              <div className="flex items-center justify-between px-6 py-4">
                <button
                  onClick={() => toggleExpanded(cat._id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {isOpen ? (
                    <ChevronUp size={16} className="text-muted-gray" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-gray" />
                  )}
                  <span className="text-caption font-semibold text-uber-black">{cat.name}</span>
                  <span className="text-micro text-muted-gray">
                    {catDishes.length} plat{catDishes.length > 1 ? "s" : ""}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openAddDish(cat._id)}
                    className="rounded-full text-micro h-8 px-3 text-body-gray hover:text-uber-black hover:bg-chip-gray"
                  >
                    <Plus size={13} className="mr-1" />
                    Plat
                  </Button>
                  <button
                    onClick={() => openEditCategory(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-chip-gray text-muted-gray hover:text-uber-black transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-muted-gray hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Dishes list */}
              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {catDishes.length === 0 && (
                    <div className="px-6 py-5 text-center">
                      <p className="text-micro text-muted-gray">Aucun plat dans cette catégorie.</p>
                    </div>
                  )}
                  {catDishes.map((dish) => (
                    <div
                      key={dish._id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-hover-light transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-caption font-medium text-uber-black truncate">
                            {dish.name}
                          </span>
                          {!dish.available && (
                            <Badge variant="secondary" className="text-[11px] rounded-full">
                              Indispo
                            </Badge>
                          )}
                        </div>
                        {dish.description && (
                          <p className="text-micro text-muted-gray mt-0.5 truncate max-w-xs">
                            {dish.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-caption font-semibold text-uber-black whitespace-nowrap">
                          {formatPrice(dish.price)}
                        </span>
                        <button
                          onClick={() => toggleAvailability(dish)}
                          className={`text-micro rounded-full px-3 py-1 font-medium transition-colors ${
                            dish.available
                              ? "bg-chip-gray text-body-gray hover:bg-hover-gray"
                              : "bg-uber-black text-pure-white hover:bg-body-gray"
                          }`}
                        >
                          {dish.available ? "Dispo" : "Remettre dispo"}
                        </button>
                        <button
                          onClick={() => openEditDish(dish)}
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-chip-gray text-muted-gray hover:text-uber-black transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteDish(dish._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-muted-gray hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      <Dialog open={catModal.open} onOpenChange={(o) => setCatModal({ open: o })}>
        <DialogContent className="rounded-[var(--radius-xl)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px] font-bold">
              {catModal.editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">Nom de la catégorie</Label>
              <Input
                placeholder="Ex : Entrées, Plats, Desserts…"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCategory()}
                className="input-zeat"
                autoFocus
              />
            </div>
            <Button
              onClick={saveCategory}
              className="w-full rounded-full bg-uber-black text-pure-white font-bold hover:bg-body-gray"
            >
              {catModal.editing ? "Enregistrer" : "Créer la catégorie"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dish Modal */}
      <Dialog open={dishModal.open} onOpenChange={(o) => setDishModal({ open: o })}>
        <DialogContent className="rounded-[var(--radius-xl)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px] font-bold">
              {dishModal.editing ? "Modifier le plat" : "Nouveau plat"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">Nom du plat</Label>
              <Input
                placeholder="Ex : Thiéboudienne"
                value={dishForm.name}
                onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                className="input-zeat"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">
                Description <span className="text-muted-gray">(optionnel)</span>
              </Label>
              <Input
                placeholder="Courte description du plat…"
                value={dishForm.description}
                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                className="input-zeat"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption font-medium">Prix (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex : 2500"
                value={dishForm.price}
                onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                className="input-zeat"
                min={0}
              />
            </div>
            <Button
              onClick={saveDish}
              className="w-full rounded-full bg-uber-black text-pure-white font-bold hover:bg-body-gray"
            >
              {dishModal.editing ? "Enregistrer" : "Ajouter le plat"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
