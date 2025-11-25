'use client';

import React, { useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/ThemeProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    shiftNumber: '',
    requestedBy: '',
    department: '',
    maintenanceType: '',
    complaintNature: '',
    startTime: '',
    finishTime: ''
  });

  const router = useRouter()

  const handleFormSubmission = async () => {
  try {
    setLoading(true); 

    const res = await fetch('https://maintenance-log-system-backend-1.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...formData }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Signup successful!");
      router.push("/");
    } else {
      toast.error(data.error || "Signup failed.");
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    toast.error("An error occurred.");
  } finally {
    setLoading(false); // end loading
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

        <Card className="w-full max-w-2xl border transition-all bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Join us today and streamline your maintenance requests
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFormSubmission();
              }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shiftNumber">Shift Number</Label>
                  <Input
                    id="shiftNumber"
                    name="shiftNumber"
                    placeholder="e.g. 1, 2, 3"
                    value={formData.shiftNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedBy">Requested By</Label>
                  <Input
                    id="requestedBy"
                    name="requestedBy"
                    placeholder="Your name"
                    value={formData.requestedBy}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="Department name"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Input
                    id="maintenanceType"
                    name="maintenanceType"
                    placeholder="Type of maintenance"
                    value={formData.maintenanceType}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="complaintNature">Nature of Complaint</Label>
                  <Textarea
                    id="complaintNature"
                    name="complaintNature"
                    placeholder="Describe the issue in detail..."
                    value={formData.complaintNature}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2 w-48">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 w-48">
                  <Label htmlFor="finishTime">Finish Time</Label>
                  <Input
                    id="finishTime"
                    name="finishTime"
                    type="time"
                    value={formData.finishTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean | undefined) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-medium leading-none">
                    Remember me
                  </Label>
                </div>

              </div>

            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
  {loading ? (
    <div className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z" />
      </svg>
      Signing Up...
    </div>
  ) : (
    "Sign Up"
  )}
</Button>

            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Button variant="link" className="px-1 text-sm h-auto" asChild>
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
