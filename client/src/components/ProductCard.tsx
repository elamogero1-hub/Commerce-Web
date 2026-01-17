import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAddToCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: number;
  name: string;
  price: number | string;
  imageUrl?: string | null;
  subcategoryId: number;
  stock?: number | null;
}

export function ProductCard({ id, name, price, imageUrl, stock = 0 }: ProductCardProps) {
  const { toast } = useToast();
  const addToCart = useAddToCart();
  const clientId = 1; // Mock client ID

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart.mutateAsync({
        clientId,
        productId: id,
        quantity: 1,
      });
      toast({
        title: "Agregado al carrito",
        description: `${name} ha sido agregado a tu carrito.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el artículo al carrito.",
        variant: "destructive",
      });
    }
  };

  const displayPrice = typeof price === 'string' ? parseFloat(price) : price;

  return (
    <Link href={`/product/${id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-border/50">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">
              Sin Imagen
            </div>
          )}
          
          {stock === 0 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
                Agotado
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="mt-1 font-medium text-muted-foreground">
            ${displayPrice.toFixed(2)}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full gap-2 font-medium" 
            onClick={handleAddToCart}
            disabled={addToCart.isPending || stock === 0}
            variant={stock === 0 ? "secondary" : "default"}
          >
            <ShoppingCart className="h-4 w-4" />
            {stock === 0 ? "No Disponible" : "Agregar al Carrito"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
