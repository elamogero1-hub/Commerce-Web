import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTracking, useAddTracking } from "@/hooks/use-tracking";
import { useOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Package, CheckCircle2, Clock, Truck } from "lucide-react";
import { format } from "date-fns";

export default function Tracking() {
  const [match, params] = useRoute("/tracking/:id?");
  const [orderId, setOrderId] = useState(params?.id || "");
  const [searchId, setSearchId] = useState("");

  const id = parseInt(orderId);
  const { data: trackingSteps, isLoading: trackingLoading } = useTracking(id);
  const { data: orderDetails, isLoading: orderLoading } = useOrder(id);

  useEffect(() => {
    if (params?.id) setOrderId(params.id);
  }, [params?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId) {
      setOrderId(searchId);
      // Update URL without reload
      window.history.pushState(null, "", `/tracking/${searchId}`);
    }
  };

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 1: return <Clock className="h-5 w-5 text-amber-500" />; // Pending
      case 2: return <Package className="h-5 w-5 text-blue-500" />; // Processing
      case 3: return <Truck className="h-5 w-5 text-purple-500" />; // Shipped
      case 4: return <CheckCircle2 className="h-5 w-5 text-green-500" />; // Delivered
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="flex-1 container px-4 py-12 md:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display font-bold">Rastrea tu Pedido</h1>
            <p className="text-muted-foreground">Ingresa el ID de tu pedido para ver el estado actual y actualizaciones de entrega.</p>
            
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mt-6">
              <Input
                placeholder="ID de Pedido (ej., 123)"
                className="h-12 text-lg"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <Button type="submit" size="lg" className="h-12 px-8">
                Rastrear
              </Button>
            </form>
          </div>

          {id ? (
            <div className="space-y-6 animate-in">
              <Card>
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-display">Pedido #{id}</CardTitle>
                    {orderDetails && (
                      <Badge variant="outline" className="bg-background">
                        Realizado el {format(new Date(orderDetails.orderDate!), 'dd MMM yyyy')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {orderLoading || trackingLoading ? (
                    <div className="space-y-4 py-8 text-center">
                      <p className="text-muted-foreground">Cargando detalles de seguimiento...</p>
                    </div>
                  ) : !orderDetails ? (
                    <div className="text-center py-8">
                      <p className="text-destructive font-medium">Pedido no encontrado.</p>
                      <p className="text-muted-foreground text-sm mt-1">Por favor verifica el ID e inténtalo nuevamente.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Tracking Timeline */}
                      <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
                        {trackingSteps?.map((step, index) => (
                          <div key={step.id} className="relative pl-8">
                            <div className="absolute -left-[9px] top-1 bg-background p-1 rounded-full border border-border shadow-sm">
                              {getStatusIcon(step.statusId)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{step.status.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(step.timestamp!), 'MMM dd, yyyy - hh:mm a')}
                              </p>
                              {step.comment && (
                                <p className="mt-2 text-sm bg-muted/50 p-2 rounded-md border inline-block">
                                  {step.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {(!trackingSteps || trackingSteps.length === 0) && (
                          <div className="pl-8">
                            <p className="text-muted-foreground italic">Aún no hay actualizaciones de seguimiento.</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-bold mb-4">Artículos en el Pedido</h4>
                        <div className="space-y-3">
                          {orderDetails.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded overflow-hidden">
                                  {item.product.imageUrl && <img src={item.product.imageUrl} className="h-full w-full object-cover" />}
                                </div>
                                <span>{item.quantity}x {item.product.name}</span>
                              </div>
                              <span className="font-medium">${parseFloat(item.historicalPrice).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t font-bold text-lg">
                          <span>Total</span>
                          <span>${parseFloat(orderDetails.total as string).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
