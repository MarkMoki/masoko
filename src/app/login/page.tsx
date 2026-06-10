"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const data = await apiFetch<{ user: { role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
        variant: "success",
      });
      if (data.user.role === "ADMIN") router.push("/admin");
      else if (data.user.role === "SELLER") router.push("/merchant");
      else router.push("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast({
        title: "Login failed",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8 md:py-12 safe-bottom">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-6 pt-6 px-6 md:px-8">
          <CardTitle className="text-xl md:text-2xl text-center">Welcome back to maSoKo</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-1">Sign in to continue shopping</p>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6 md:pb-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1.5 h-11 mobile-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1.5 h-11 mobile-input"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 mobile-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {`Don't have an account? `}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
