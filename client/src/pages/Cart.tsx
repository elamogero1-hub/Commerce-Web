import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart, useRemoveFromCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Cart() {
  const [, setLocation] = useLocation();
  const clientId = 1;
  const { data: cartItems, isLoading } = useCart(clientId);
  const removeFromCart = useRemoveFromCart();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const subtotal = cartItems?.reduce((acc, item) => {
    const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
    return acc + (price * item.quantity);
  }, 0) || 0;
  
  const shipping = 10.00;
  const total = subtotal > 0 ? subtotal + shipping : 0;

  const handleRemove = async (id: number) => {
    try {
      await removeFromCart.mutateAsync({ id, clientId });
      toast({ title: "Item removed" });
    } catch (error) {
      toast({ title: "Error removing item", variant: "destructive" });
    }
  };

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;

    try {
      // Create order
      const order = await createOrder.mutateAsync({
        clientId,
        paymentMethodId: 1, // Defaulting to first payment method for now
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price,
        })),
      });

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.id} has been created.`,
      });
      
      setLocation(`/tracking/${order.id}`);
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="flex-1 container px-4 py-8 md:px-6">
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))
            ) : cartItems?.length === 0 ? (
              <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
                <div className="bg-muted inline-flex p-4 rounded-full mb-4">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
                <Link href="/catalog">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              cartItems?.map((item) => {
                const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
                return (
                  <Card key={item.id} className="overflow-hidden border-border/60 shadow-sm">
                    <CardContent className="p-4 flex gap-4 items-center">
                      <div className="h-20 w-20 bg-muted rounded-lg overflow-hidden shrink-0">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg">${(price * item.quantity).toFixed(2)}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                          onClick={() => handleRemove(item.id)}
                          disabled={removeFromCart.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-border/60">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-display font-bold text-xl">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">${subtotal > 0 ? shipping.toFixed(2) : "0.00"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!cartItems?.length || createOrder.isPending}
                >
                  {createOrder.isPending ? "Processing..." : (
                    <>Checkout <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout powered by Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
