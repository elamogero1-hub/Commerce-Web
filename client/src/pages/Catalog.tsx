import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

export default function Catalog() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("search");

  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState(initialSearch || "");
  const [activeSearch, setActiveSearch] = useState(initialSearch || undefined);

  // This is a simplification. Ideally, we filter by category then select subcategory.
  // For now, we'll fetch all and filter client-side or assume subcategory ID is passed.
  
  const { data: products, isLoading: productsLoading } = useProducts(selectedSubcategory, activeSearch);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const clearFilters = () => {
    setSelectedSubcategory(undefined);
    setSearchTerm("");
    setActiveSearch(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      
      <div className="container px-4 py-8 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-8">
            <div>
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">Categories</h4>
                  {categoriesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories?.map((category) => (
                        <div key={category.id}>
                          <p className="font-medium text-foreground mb-2">{category.name}</p>
                          <div className="pl-2 space-y-1 border-l-2 border-border ml-1">
                            {category.subcategories.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => setSelectedSubcategory(sub.id === selectedSubcategory ? undefined : sub.id)}
                                className={`block text-sm text-left w-full py-1 px-2 rounded-md transition-colors ${
                                  selectedSubcategory === sub.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {(selectedSubcategory || activeSearch) && (
              <Button variant="outline" className="w-full border-dashed" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" /> Clear All Filters
              </Button>
            )}
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6 space-y-4">
              <h1 className="text-3xl font-display font-bold">Catalog</h1>
              
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-9 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
              
              {activeSearch && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Results for: <Badge variant="secondary" className="text-foreground">{activeSearch}</Badge>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
              ) : products?.length === 0 ? (
                <div className="col-span-full py-12 text-center border rounded-xl bg-muted/20">
                  <h3 className="text-lg font-medium text-foreground">No products found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                    Clear filters
                  </Button>
                </div>
              ) : (
                products?.map((product) => (
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
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
