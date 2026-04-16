"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmée",
  done: "Terminée",
} as const;

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-chip-gray text-body-gray border-border",
} as const;

type Order = {
  _id: Id<"orders">;
  customerName: string;
  customerPhone?: string;
  note?: string;
  items: { dishName: string; quantity: number; unitPrice: number }[];
  total: number;
  status: "pending" | "confirmed" | "done";
  createdAt: number;
};

const PAGE_SIZE = 20;

export default function OrdersPage() {
  // Paginated — loads 20 at a time, not all orders at once
  const { results: orders, status, loadMore } = usePaginatedQuery(
    api.orders.listPaginated,
    {},
    { initialNumItems: PAGE_SIZE }
  );
  const updateStatus = useMutation(api.orders.updateStatus);

  const handleStatus = async (id: Id<"orders">, status: "pending" | "confirmed" | "done") => {
    await updateStatus({ id, status });
    toast.success("Statut mis à jour");
  };

  const pending   = orders.filter((o) => o.status === "pending");
  const confirmed = orders.filter((o) => o.status === "confirmed");
  const done      = orders.filter((o) => o.status === "done");

  const isLoading = status === "LoadingFirstPage";

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Commandes"
        description={`${pending.length} en attente · ${confirmed.length} confirmée${confirmed.length > 1 ? "s" : ""}`}
      />

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 pb-24">
        {!isLoading && orders.length === 0 && (
          <div className="card-whisper p-8 sm:p-12 text-center">
            <p className="text-body text-muted-gray">
              Aucune commande pour l&apos;instant. Partagez votre lien menu !
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-whisper p-5 animate-pulse h-28" />
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <Section title="En attente" count={pending.length} dot="bg-amber-400">
            {pending.map((o) => (
              <OrderCard key={o._id} order={o}
                onConfirm={() => handleStatus(o._id, "confirmed")}
                onDone={() => handleStatus(o._id, "done")} />
            ))}
          </Section>
        )}

        {confirmed.length > 0 && (
          <Section title="En préparation" count={confirmed.length} dot="bg-blue-400">
            {confirmed.map((o) => (
              <OrderCard key={o._id} order={o} onDone={() => handleStatus(o._id, "done")} />
            ))}
          </Section>
        )}

        {done.length > 0 && (
          <Section title="Terminées" count={done.length} dot="bg-chip-gray">
            {done.map((o) => <OrderCard key={o._id} order={o} />)}
          </Section>
        )}

        {status === "CanLoadMore" && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => loadMore(PAGE_SIZE)}
              className="rounded-full border-border text-caption font-medium"
            >
              Charger plus de commandes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, count, dot, children }: {
  title: string; count: number; dot: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dot}`} />
        <h2 className="text-caption font-semibold text-uber-black">{title}</h2>
        <span className="text-micro text-muted-gray">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OrderCard({ order, onConfirm, onDone }: {
  order: Order; onConfirm?: () => void; onDone?: () => void;
}) {
  const time = new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div className="card-whisper px-4 sm:px-6 py-4 sm:py-5">
      {/* Header row: name + badge + time + total */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-caption font-semibold text-uber-black">{order.customerName}</p>
            <Badge variant="outline" className={`text-[11px] rounded-full shrink-0 ${STATUS_STYLES[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-micro text-muted-gray mt-0.5">{date} à {time}</p>
        </div>
        <p className="font-heading text-[18px] sm:text-[20px] font-bold text-uber-black shrink-0">
          {formatPrice(order.total)}
        </p>
      </div>

      {/* Items */}
      <ul className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-2 text-micro text-body-gray">
            <span className="font-semibold shrink-0">{item.quantity}×</span>
            <span className="truncate">{item.dishName}</span>
            <span className="text-muted-gray shrink-0 ml-auto">{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="text-micro text-muted-gray italic mb-2">&ldquo;{order.note}&rdquo;</p>
      )}
      {order.customerPhone && (
        <p className="text-micro text-muted-gray mb-3">📞 {order.customerPhone}</p>
      )}

      {/* Action buttons */}
      {(onConfirm || onDone) && (
        <div className="flex gap-2 pt-1">
          {onConfirm && (
            <button onClick={onConfirm}
              className="flex-1 sm:flex-none rounded-full bg-uber-black text-white text-micro font-bold px-4 py-2 hover:bg-body-gray transition-colors">
              Confirmer
            </button>
          )}
          {onDone && (
            <button onClick={onDone}
              className="flex-1 sm:flex-none rounded-full bg-chip-gray text-uber-black text-micro font-medium px-4 py-2 hover:bg-hover-gray transition-colors">
              Terminée
            </button>
          )}
        </div>
      )}
    </div>
  );
}
