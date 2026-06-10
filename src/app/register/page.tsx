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

export default function RegisterPage() {
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
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          password: form.get("password"),
        }),
      });
      toast({
        title: "Account created!",
        description: "Welcome to maSoKo. You're being redirected.",
        variant: "success",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast({
        title: "Registration failed",
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
          <CardTitle className="text-xl md:text-2xl text-center">Join maSoKo</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-1">Find the best deals from local sellers</p>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6 md:pb-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                required
                className="mt-1.5 h-11 mobile-input"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
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
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="mt-1.5 h-11 mobile-input"
                placeholder="+254 700 000 000"
                autoComplete="tel"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                className="mt-1.5 h-11 mobile-input"
                placeholder="At least 6 characters"
                autoComplete="new-password"
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
