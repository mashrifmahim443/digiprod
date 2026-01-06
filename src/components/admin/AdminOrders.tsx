import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  customer_email: string;
  customer_name: string | null;
  product_id: string;
  amount_paid: number;
  status: string;
  payment_id: string | null;
  payment_method: string | null;
  key_delivered: string | null;
  coupon_code: string | null;
  discount_amount: number | null;
  created_at: string;
  product_title?: string;
  delivered_key?: string;
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          products:product_id (title),
          product_keys:key_delivered (key_or_link)
        `)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const formattedOrders = (ordersData || []).map((order: any) => ({
        ...order,
        product_title: order.products?.title || "Unknown",
        delivered_key: order.product_keys?.key_or_link || null,
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: "completed" | "pending" | "refunded" | "failed") => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast({ title: "Order status updated" });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "refunded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Coupon</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <code className="text-xs">{order.id.slice(0, 8)}...</code>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{order.customer_name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{order.product_title}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">${order.amount_paid.toFixed(2)}</div>
                        {order.discount_amount && order.discount_amount > 0 && (
                          <div className="text-xs text-green-600">-${order.discount_amount.toFixed(2)}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {order.coupon_code ? (
                        <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {order.coupon_code}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Order ID</div>
                  <code className="text-xs">{selectedOrder.id}</code>
                </div>
                <div>
                  <div className="text-muted-foreground">Date</div>
                  <div>{new Date(selectedOrder.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Customer Name</div>
                  <div className="font-medium">{selectedOrder.customer_name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Customer Email</div>
                  <div className="font-medium">{selectedOrder.customer_email}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Product</div>
                  <div className="font-medium">{selectedOrder.product_title}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Amount Paid</div>
                  <div className="font-medium">${selectedOrder.amount_paid.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Coupon Used</div>
                  <div className="font-medium">
                    {selectedOrder.coupon_code ? (
                      <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {selectedOrder.coupon_code}
                      </code>
                    ) : (
                      "None"
                    )}
                  </div>
                </div>
                {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                  <div>
                    <div className="text-muted-foreground">Discount Amount</div>
                    <div className="font-medium text-green-600">-${selectedOrder.discount_amount.toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <div className="text-muted-foreground">Payment Method</div>
                  <div>{selectedOrder.payment_method || "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Payment ID</div>
                  <code className="text-xs">{selectedOrder.payment_id || "N/A"}</code>
                </div>
              </div>

              {selectedOrder.delivered_key && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Delivered Key</div>
                  <code className="text-sm break-all">{selectedOrder.delivered_key}</code>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Update Status</div>
                <div className="flex gap-2">
                  {(["completed", "pending", "refunded", "failed"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedOrder.status === status ? "default" : "outline"}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, status);
                        setSelectedOrder({ ...selectedOrder, status });
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
