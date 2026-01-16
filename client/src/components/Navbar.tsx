import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Search, Package, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  
  // Mock client ID for now
  const clientId = 1;
  const { data: cartItems } = useCart(clientId);
  const cartCount = cartItems?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/catalog?search=${encodeURIComponent(search)}`);
    }
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'} ${mobile ? 'text-lg py-2' : ''}`}>
        Home
      </Link>
      <Link href="/catalog" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/catalog' ? 'text-primary' : 'text-muted-foreground'} ${mobile ? 'text-lg py-2' : ''}`}>
        Catalog
      </Link>
      <Link href="/tracking" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/tracking' ? 'text-primary' : 'text-muted-foreground'} ${mobile ? 'text-lg py-2' : ''}`}>
        Track Order
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-display text-xl">
              SmartCommerce
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLinks />
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className="flex flex-1 items-center justify-between md:hidden">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <Package className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">SmartCommerce</span>
              </Link>
              <div className="flex flex-col space-y-3">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold font-display">SmartCommerce</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full bg-muted/50 focus:bg-background transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <nav className="flex items-center space-x-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User Profile</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
