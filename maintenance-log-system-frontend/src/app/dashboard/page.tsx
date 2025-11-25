'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const Dashboard = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('https://maintenance-log-system-backend-1.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Logged out successfully!');
        router.push('/signin');
      } else {
        toast.error(data.error || 'Logout failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during logout');
    }
  };

  const handleDownload = () => {
    window.open('https://maintenance-log-system-backend-1.onrender.com/api/file/download-csv', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200  px-6 py-12 text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-black">Welcome to the Dashboard</h1>

      <Button
        variant="default"
        className="w-[200px] mb-4 cursor-pointer"
        onClick={handleDownload}
      >
        Download CSV
      </Button>

      <Button
        variant="destructive"
        onClick={handleLogout}
        className="text-white w-[200px] shadow-md cursor-pointer" >
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
