
import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Erfolgreich abgemeldet");
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && (
        <header className="border-b border-border py-4">
          <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-xl font-medium notion-heading">Vergabebausteine</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Angemeldet als {user?.name || user?.email || "Testnutzer"}
              </span>
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                className="notion-btn-ghost text-sm"
              >
                Abmelden
              </Button>
            </div>
          </div>
        </header>
      )}

      <main>
        {children}
      </main>

      <footer className="py-6 border-t border-border mt-12">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vergabebausteine - Ein Tool zur Bedarfsanalyse im Vergabeprozess</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
