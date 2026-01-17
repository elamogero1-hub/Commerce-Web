import { Package, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl font-display">SmartCommerce</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Soluciones de comercio electrónico premium que ofrecen productos de calidad con experiencias de compra fluidas.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Tienda</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Todos los Productos</Link></li>
              <li><Link href="/catalog?category=new" className="hover:text-primary transition-colors">Nuevos Ingresos</Link></li>
              <li><Link href="/catalog?category=featured" className="hover:text-primary transition-colors">Destacados</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Soporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tracking" className="hover:text-primary transition-colors">Rastrear Pedido</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contáctanos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Conecta</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SmartCommerce S.A. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
