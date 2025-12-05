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
      await apiPost("/auth/login", { email, password });
      toast.success("Login successful!");
      router.push("/home");
    } catch (err: any) {
      toast.error(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        darkMode
          ? "bg-[#0b1220] text-white"
          : "bg-gradient-to-b from-gray-100 to-gray-200"
      }`}
    >
      {/* THEME TOGGLE */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        {darkMode ? (
          <SunIcon className="h-5 w-5 text-yellow-300" />
        ) : (
          <MoonIcon className="h-5 w-5 text-gray-700" />
        )}
      </div>

      <Card
        className={`w-full max-w-md shadow-xl rounded-2xl ${
          darkMode ? "bg-[#111827]/60 backdrop-blur-xl" : "bg-white"
        }`}
      >
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Welcome Back 👋</CardTitle>
          <CardDescription className="mt-1">
            Sign in to access the maintenance system
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={darkMode ? "bg-gray-800 border-gray-700" : ""}
              />
            </div>

            {/* Password */}
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={darkMode ? "bg-gray-800 border-gray-700" : ""}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={() => setRememberMe(!rememberMe)}
              />
              <Label>Remember me</Label>
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="w-full text-md py-3 rounded-lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-4 pb-6">
          <p className="text-sm">
            Don't have an account?{" "}
            <Button variant="link" asChild className="px-1">
              <Link href="/signup">Create Account</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
