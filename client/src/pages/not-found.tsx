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
        
        <h1 className="text-4xl font-display font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link href="/">
          <Button size="lg" className="w-full">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
