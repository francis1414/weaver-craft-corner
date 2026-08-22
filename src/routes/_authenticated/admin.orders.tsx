import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useOrders } from "@/hooks/use-store-data";
import { updateRow } from "@/lib/store-api";
import type { FulfillmentStatus, Order, PaymentStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const PAYMENT: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const FULFILMENT: FulfillmentStatus[] = ["unfulfilled", "processing", "shipped", "delivered"];
const CARRIERS = ["DHL Express", "FedEx", "Ghana Post"];

function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const queryClient = useQueryClient();
  const [payment, setPayment] = useState("all");
  const [fulfilment, setFulfilment] = useState("all");
  const [openOrder, setOpenOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState(CARRIERS[0]!);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const visible = orders.filter(
    (o) =>
      (payment === "all" || o.paymentStatus === payment) &&
      (fulfilment === "all" || o.fulfillmentStatus === fulfilment),
  );

  async function patch(order: Order, values: Record<string, unknown>) {
    try {
      await updateRow("orders", order.id, values);
      toast.success("Order updated");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  function open(order: Order) {
    setOpenOrder(order);
    setTracking(order.trackingNumber ?? "");
    setCarrier(order.trackingCarrier ?? CARRIERS[0]!);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Orders &amp; fulfilment</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders in total.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {PAYMENT.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fulfilment} onValueChange={setFulfilment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Fulfilment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fulfilment</SelectItem>
            {FULFILMENT.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfilment</th>
              <th className="p-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  Loading orders…
                </td>
              </tr>
            )}
            {!isLoading && visible.length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  No orders match these filters.
                </td>
              </tr>
            )}
            {visible.map((order) => (
              <tr key={order.id}>
                <td className="p-4">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="p-4">
                  <p>{order.customer?.name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer?.email}</p>
                </td>
                <td className="p-4">${order.total.toFixed(2)}</td>
                <td className="p-4">
                  <Select
                    value={order.paymentStatus}
                    onValueChange={(v) => patch(order, { payment_status: v })}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4">
                  <Select
                    value={order.fulfillmentStatus}
                    onValueChange={(v) => patch(order, { fulfillment_status: v })}
                  >
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FULFILMENT.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => open(order)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={openOrder !== null} onOpenChange={(o) => !o && setOpenOrder(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">{openOrder?.orderNumber}</SheetTitle>
          </SheetHeader>
          {openOrder && (
            <div className="mt-6 space-y-6 text-sm">
              <div className="flex gap-2">
                <Badge variant="outline">{openOrder.paymentStatus}</Badge>
                <Badge variant="secondary">{openOrder.fulfillmentStatus}</Badge>
                <Badge variant="outline">{openOrder.paymentMethod}</Badge>
              </div>

              <section>
                <h3 className="font-serif text-lg">Line items</h3>
                <ul className="mt-2 divide-y divide-border">
                  {openOrder.items.map((item, i) => (
                    <li key={`${item.productId}-${i}`} className="flex justify-between py-2">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 space-y-1 text-muted-foreground">
                  <Row label="Subtotal" value={openOrder.subtotal} />
                  <Row label="Shipping" value={openOrder.shippingCost} />
                  <Row label="Tax" value={openOrder.tax} />
                  <Row label="Discount" value={-openOrder.discount} />
                </dl>
                <p className="mt-2 flex justify-between font-medium text-foreground">
                  <span>Total</span>
                  <span>${openOrder.total.toFixed(2)}</span>
                </p>
              </section>

              <section>
                <h3 className="font-serif text-lg">Shipping address</h3>
                <p className="mt-2 text-muted-foreground">
                  {openOrder.customer?.name}
                  <br />
                  {openOrder.customer?.address}
                  <br />
                  {openOrder.customer?.city} {openOrder.customer?.postalCode}
                  <br />
                  {openOrder.customer?.country}
                  <br />
                  {openOrder.customer?.phone}
                </p>
              </section>

              {openOrder.customerNotes && (
                <section>
                  <h3 className="font-serif text-lg">Customer notes</h3>
                  <p className="mt-2 text-muted-foreground">{openOrder.customerNotes}</p>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="font-serif text-lg">Tracking</h3>
                <div className="space-y-2">
                  <Label>Carrier</Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRIERS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tracking number</Label>
                  <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
                </div>
                <Button
                  onClick={async () => {
                    await patch(openOrder, {
                      tracking_number: tracking || null,
                      tracking_carrier: carrier,
                      fulfillment_status:
                        openOrder.fulfillmentStatus === "unfulfilled"
                          ? "shipped"
                          : openOrder.fulfillmentStatus,
                    });
                    setOpenOrder(null);
                  }}
                >
                  Save tracking &amp; mark shipped
                </Button>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd>${value.toFixed(2)}</dd>
    </div>
  );
}
