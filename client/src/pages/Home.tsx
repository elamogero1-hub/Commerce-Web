import { Link } from "wouter";
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 py-20 lg:py-32">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-6 animate-in">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                Nueva Colección Disponible
              </div>
              <h1 className="text-4xl font-display font-bold tracking-tight sm:text-6xl text-foreground">
                Descubre Calidad Premium para tu Estilo de Vida
              </h1>
              <p className="max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                SmartCommerce te trae productos seleccionados de los mejores proveedores. 
                Experimenta compras fluidas con entrega rápida y pagos seguros.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/catalog">
                  <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Comprar Ahora <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tracking">
                  <Button size="lg" variant="outline" className="text-base px-8 h-12">
                    Rastrear Pedido
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                {/* Hero Lifestyle Image */}
                <img
                  alt="Modern Electronics Setup"
                  className="h-full w-full object-cover"
                  src="https://pixabay.com/get/gef2510bd323b20b956694cf3de2877d91054d0750567978e769b5c9e3bdcc9292f6213778661d0d9e1592d594fb7c25717bbfa6f2896f1318fbf50ea1f6548fb_1280.jpg"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-square h-[400px] rounded-full bg-primary" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-square h-[300px] rounded-full bg-accent" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-16 md:px-6 border-b">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Selección Curada</h3>
            <p className="text-sm text-muted-foreground">Productos seleccionados para garantizar calidad.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Entrega Rápida</h3>
            <p className="text-sm text-muted-foreground">Rastreo en tiempo real para cada pedido.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Pago Seguro</h3>
            <p className="text-sm text-muted-foreground">Proceso de pago 100% seguro.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Soporte 24/7</h3>
            <p className="text-sm text-muted-foreground">Estamos aquí para ayudarte en cualquier momento.</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold tracking-tight">Comprar por Categoría</h2>
            <Link href="/catalog">
              <Button variant="ghost" className="gap-1">
                Ver Todo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))
            ) : (
              categories?.slice(0, 3).map((category) => (
                <Link key={category.id} href={`/catalog?category=${category.id}`}>
                  <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border hover:shadow-md transition-all h-48 flex flex-col justify-center items-center text-center p-6 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-2xl font-bold mb-2 relative z-10 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-muted-foreground relative z-10">{category.description}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-display font-bold tracking-tight mb-8">Productos Destacados</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {productsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : (
              featuredProducts?.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  subcategoryId={product.subcategoryId}
                  stock={product.stock}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
