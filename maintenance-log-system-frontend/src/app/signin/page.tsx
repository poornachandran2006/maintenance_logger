'use client';

import React, { useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/lib/ThemeProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SignInPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      const res = await fetch('https://maintenance-log-system-backend-1.onrender.com/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Login successful!');
        router.push("/")
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };


  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen w-full`}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 transition-colors bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Switch
            checked={darkMode}
            onCheckedChange={() => toggleDarkMode()}
            className="data-[state=checked]:bg-amber-500"
          />
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-amber-400" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-700" />
          )}
        </div>

        <Card className="w-full max-w-md border transition-all bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back 👋</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Sign in to continue 
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-medium leading-none">
                    Remember me
                  </Label>
                </div>


              </div>

              <Button type="submit" className="w-full cursor-pointer">
                Sign In
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              New user?{' '}
              <Button variant="link" className="px-1 text-sm h-auto cursor-pointer" asChild>
                <Link href="/signup">Create an account</Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
