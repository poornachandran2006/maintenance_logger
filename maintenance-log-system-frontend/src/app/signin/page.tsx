"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/ThemeProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function SignInPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // ⬇️ hit backend login route
      await apiPost("/auth/login", { email, password });

      toast.success("Login successful!");

      // ⬇️ THIS IS THE IMPORTANT PART:
      // after login, always go to the main website page
      router.push("/home");
    } catch (err: any) {
      console.error("Login error", err);
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen w-full`}>
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        {/* Theme toggle */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-amber-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-600" />
          )}
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome Back 👋
            </CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={() => setRememberMe(!rememberMe)}
                />
                <Label>Remember me</Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm">
              New user?{" "}
              <Button variant="link" asChild>
                <Link href="/signup">Create an account</Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
