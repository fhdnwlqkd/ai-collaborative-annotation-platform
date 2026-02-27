"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Hexagon, Eye, EyeOff } from "lucide-react";

export function SignupPage({
  onSignup,
  onGoToLogin,
}: {
  onSignup: () => void;
  onGoToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignup();
    }, 800);
  }

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Hexagon className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            LabelForge
          </h1>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <h2 className="text-card-foreground text-center text-xl font-semibold">
              Create your account
            </h2>
            <p className="text-muted-foreground mt-1 text-center text-sm">
              Start collaborating on AI annotation projects
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-foreground">
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Kim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="alex@labelforge.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 w-full"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <button
                  onClick={onGoToLogin}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
