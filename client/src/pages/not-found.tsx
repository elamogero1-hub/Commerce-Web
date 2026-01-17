import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-6 rounded-full">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-bold text-foreground">Página No Encontrada</h1>
        <p className="text-muted-foreground text-lg">
          La página que buscas no existe o ha sido movida.
        </p>
        
        <Link href="/">
          <Button size="lg" className="w-full">Volver al Inicio</Button>
        </Link>
      </div>
    </div>
  );
}
