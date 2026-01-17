import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Truck, Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  
  const { data: product, isLoading, error } = useProduct(id);
  const addToCart = useAddToCart();
  const { toast } = useToast();
  const clientId = 1;

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart.mutateAsync({
        clientId,
        productId: product.id,
        quantity: 1,
      });
      toast({
        title: "Agregado al carrito",
        description: `${product.name} ha sido agregado a tu carrito.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo agregar el artículo al carrito.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container px-4 py-8 md:px-6 flex-1">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-1/3" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
          <p className="text-muted-foreground mb-4">El producto que buscas no existe.</p>
          <Link href="/catalog">
            <Button>Volver al Catálogo</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <main className="flex-1 container px-4 py-8 md:px-6">
        <Link href="/catalog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Catálogo
        </Link>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Image Gallery Side */}
          <div className="bg-muted rounded-2xl overflow-hidden aspect-square relative shadow-inner">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sin Imagen Disponible
              </div>
            )}
            
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  Agotado
                </span>
              </div>
            )}
          </div>
          
          {/* Product Info Side */}
          <div className="space-y-8 animate-in">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                  ID: {product.id}
                </Badge>
                {product.stock && product.stock < 5 && product.stock > 0 && (
                  <span className="text-sm font-medium text-amber-600">
                    ¡Solo quedan {product.stock} en stock!
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <div className="text-3xl font-bold text-primary">
                ${price.toFixed(2)}
              </div>
            </div>
            
            <div className="prose prose-sm text-muted-foreground leading-relaxed">
              <p>{product.description || "No hay descripción disponible para este producto."}</p>
            </div>
            
            <div className="pt-6 border-t space-y-4">
              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20"
                onClick={handleAddToCart}
                disabled={addToCart.isPending || product.stock === 0}
              >
                {addToCart.isPending ? "Agregando..." : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Agregar al Carrito
                  </>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-secondary">
                  <Truck className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <span className="font-semibold block text-foreground">Entrega Rápida</span>
                    <span className="text-muted-foreground">2-4 días hábiles</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-secondary">
                  <Shield className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <span className="font-semibold block text-foreground">Pago Seguro</span>
                    <span className="text-muted-foreground">Pagos encriptados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
