"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";
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

export default function OrdersPage() {
  const orders = useQuery(api.orders.listByRestaurant);
  const updateStatus = useMutation(api.orders.updateStatus);

  const handleStatus = async (
    id: Id<"orders">,
    status: "pending" | "confirmed" | "done"
  ) => {
    await updateStatus({ id, status });
    toast.success("Statut mis à jour");
  };

  const pending = orders?.filter((o) => o.status === "pending") ?? [];
  const confirmed = orders?.filter((o) => o.status === "confirmed") ?? [];
  const done = orders?.filter((o) => o.status === "done") ?? [];

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Commandes"
        description={`${pending.length} en attente · ${confirmed.length} confirmée${confirmed.length > 1 ? "s" : ""}`}
      />

      <div className="p-8 space-y-8">
        {orders?.length === 0 && (
          <div className="card-whisper p-12 text-center">
            <p className="text-body text-muted-gray">
              Aucune commande pour l&apos;instant. Partagez votre lien menu !
            </p>
          </div>
        )}

        {pending.length > 0 && (
          <Section title="En attente" count={pending.length} dot="bg-amber-400">
            {pending.map((o) => (
              <OrderCard
                key={o._id}
                order={o}
                onConfirm={() => handleStatus(o._id, "confirmed")}
                onDone={() => handleStatus(o._id, "done")}
              />
            ))}
          </Section>
        )}

        {confirmed.length > 0 && (
          <Section title="En préparation" count={confirmed.length} dot="bg-blue-400">
            {confirmed.map((o) => (
              <OrderCard
                key={o._id}
                order={o}
                onDone={() => handleStatus(o._id, "done")}
              />
            ))}
          </Section>
        )}

        {done.length > 0 && (
          <Section title="Terminées" count={done.length} dot="bg-chip-gray">
            {done.map((o) => (
              <OrderCard key={o._id} order={o} />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  dot,
  children,
}: {
  title: string;
  count: number;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <h2 className="text-caption font-semibold text-uber-black">{title}</h2>
        <span className="text-micro text-muted-gray">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OrderCard({
  order,
  onConfirm,
  onDone,
}: {
  order: Order;
  onConfirm?: () => void;
  onDone?: () => void;
}) {
  const time = new Date(order.createdAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(order.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="card-whisper px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-caption font-semibold text-uber-black">
              {order.customerName}
            </p>
            <Badge
              variant="outline"
              className={`text-[11px] rounded-full ${STATUS_STYLES[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-micro text-muted-gray">{date} à {time}</p>

          {/* Items */}
          <ul className="mt-3 space-y-1">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-micro text-body-gray">
                <span className="font-medium">{item.quantity}×</span>
                <span>{item.dishName}</span>
                <span className="text-muted-gray">— {formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>

          {order.note && (
            <p className="mt-2 text-micro text-muted-gray italic">
              &ldquo;{order.note}&rdquo;
            </p>
          )}

          {order.customerPhone && (
            <p className="mt-1 text-micro text-muted-gray">
              📞 {order.customerPhone}
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="font-heading text-[18px] font-bold text-uber-black">
            {formatPrice(order.total)}
          </p>
          <div className="flex flex-col gap-2 mt-3">
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="rounded-full bg-uber-black text-pure-white text-micro font-bold px-4 py-2 hover:bg-body-gray transition-colors"
              >
                Confirmer
              </button>
            )}
            {onDone && (
              <button
                onClick={onDone}
                className="rounded-full bg-chip-gray text-uber-black text-micro font-medium px-4 py-2 hover:bg-hover-gray transition-colors"
              >
                Terminée
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
