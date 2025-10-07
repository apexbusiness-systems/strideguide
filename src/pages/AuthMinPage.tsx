import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthMinPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setResult({ error: error.message, status: error.status });
      } else {
        setResult({ success: true, user: data.user });
      }
    } catch (err: any) {
      setResult({ error: err.message, name: err.name });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        setResult({ error: error.message, status: error.status });
      } else {
        setResult({ success: true, user: data.user });
      }
    } catch (err: any) {
      setResult({ error: err.message, name: err.name });
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setResult({ currentUser: data.user });
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Auth Min (Raw Supabase)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="flex gap-2">
            <Button onClick={handleSignIn} disabled={isLoading} className="flex-1">
              Sign In
            </Button>
            <Button onClick={handleSignUp} disabled={isLoading} variant="outline" className="flex-1">
              Sign Up
            </Button>
          </div>

          <Button onClick={getUser} variant="secondary" className="w-full">
            Get Current User
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
