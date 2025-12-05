"use client";

import React, { useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/ThemeProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "worker",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully! Please login.");
        router.push("/signin");
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch (err) {
      toast.error("Unable to connect to backend → Start backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen w-full`}>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-amber-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-600" />
          )}
        </div>

        <Card className="w-full max-w-lg dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription>Register to access the maintenance system</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label>Department</Label>
                <Input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Maintenance / Production / QA"
                />
              </div>

              <div>
                <Label>Role</Label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-800"
                >
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <Button className="w-full cursor-pointer" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>

            </form>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Button variant="link" asChild>
                <Link href="/signin">Login</Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
