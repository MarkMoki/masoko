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
    <div className="container mx-auto flex max-w-md flex-col px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create customer account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={6} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
