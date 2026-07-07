import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Music2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen pattern-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Music2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">
              MusiquePeulh
            </span>
          </Link>
        </div>

        <div className="card-gradient p-8 rounded-xl border border-border text-center">
          <h1 className="text-7xl font-bold text-gradient mb-2">404</h1>
          <h2 className="text-2xl font-bold mb-2">Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Button
            asChild
            className="w-full hero-gradient text-primary-foreground hover:opacity-90"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
