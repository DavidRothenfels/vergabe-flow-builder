
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

const LoginPage = () => {
  const { login, testLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success("Login erfolgreich!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      await testLogin();
      toast.success("Test-Login erfolgreich!");
    } catch (error) {
      console.error("Test login error:", error);
      toast.error("Test-Login fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold notion-heading mb-2">Vergabebausteine</h1>
          <p className="text-muted-foreground">Ihr Werkzeug für Bedarfsanalyse im Vergabeprozess</p>
        </div>
        
        <Card className="notion-card">
          <CardHeader>
            <CardTitle>Anmeldung</CardTitle>
            <CardDescription>
              Melden Sie sich an, um Ihre Bedarfsanalyse zu erstellen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="beispiel@domain.de"
                  className="notion-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="notion-input"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="notion-btn-primary w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Anmeldung..." : "Anmelden"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">oder</span>
              </div>
            </div>
            <Button 
              onClick={handleTestLogin} 
              variant="outline" 
              className="w-full notion-btn-secondary"
              disabled={isLoading}
            >
              Test-Login verwenden
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
