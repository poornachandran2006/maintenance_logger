"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiDatabase,
  FiUsers,
  FiLogIn,
  FiBarChart2,
  FiClock
} from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "../_components/auth-button";

export default function FeaturesClient() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* NAVBAR */}
      <nav
        className={`backdrop-blur-md border-b fixed w-full px-6 py-4 flex items-center justify-between z-50 ${
          darkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        {/* LEFT SIDE */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FiActivity className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              MaintenanceLog
            </span>
          </div>

          {/* NAV LINKS */}
          <div className="hidden md:flex space-x-6">
            <Link
              href="/home"
              onClick={() => setActiveTab("home")}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === "home"
                  ? "text-blue-500 font-medium"
                  : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"
              }`}
            >
              Home
            </Link>

            <Link
              href="/features"
              onClick={() => setActiveTab("features")}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === "features"
                  ? "text-blue-500 font-medium"
                  : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"
              }`}
            >
              Features
            </Link>

            <Link
              href="/solutions"
              onClick={() => setActiveTab("solutions")}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === "solutions"
                  ? "text-blue-500 font-medium"
                  : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"
              }`}
            >
              Solutions
            </Link>

            <Link
              href="/pricing"
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === "pricing"
                  ? "text-blue-500 font-medium"
                  : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"
              }`}
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center space-x-4">
          {/* DARK MODE SWITCH */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-colors ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" />
            )}
          </div>

          {/* DASHBOARD BUTTON */}
          <Link
            href="/dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {/* LOGIN / LOGOUT */}
          <AuthButton darkMode={darkMode} />
        </div>
      </nav>

      {/* All your UI sections go here
          (you already sent this, and it works fine)
      */}
    </div>
  );
}
