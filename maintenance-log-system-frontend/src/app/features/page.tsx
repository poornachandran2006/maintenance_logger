"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiDatabase,
  FiUsers,
  FiSettings,
  FiLogIn,
  FiBarChart2,
  FiClock,
} from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "../_components/auth-button";

export default function FeaturesPage() {
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
      {/* NAVBAR (same tone as Home) */}
      <nav
        className={`backdrop-blur-md border-b fixed w-full px-6 py-4 flex items-center justify-between z-50 ${
          darkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FiActivity className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              MaintenanceLog
            </span>
          </div>

          <div className="hidden md:flex space-x-6">
            <Link
              href="/"
              onClick={() => setActiveTab("home")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "home"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              href="/features"
              onClick={() => setActiveTab("features")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "features"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Features
            </Link>
            <Link
              href="/solutions"
              onClick={() => setActiveTab("solutions")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "solutions"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Solutions
            </Link>
            <Link
              href="/pricing"
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "pricing"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Pricing
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-colors duration-300 ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
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

          <Link
            href="/dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <AuthButton darkMode={darkMode} />
        </div>
      </nav>

      {/* PAGE HERO */}
      <header className="pt-28 pb-8 px-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Features built for industrial maintenance teams
          </h1>
          <p
            className={`max-w-3xl mx-auto text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Everything you need to log, monitor and analyze maintenance
            operations — from per-shift attendance to machine downtime analytics
            and role-based access controls.
          </p>
        </div>
      </header>

      {/* 1. Features Grid (cards) */}
      <section className={`px-6 pb-16 max-w-6xl mx-auto ${darkMode ? "" : ""}`}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <FiActivity className="h-8 w-8 text-blue-500" />,
              title: "Maintenance Logging",
              desc: "Record routine, preventive, predictive, breakdown and implementation logs with optional sensor readings.",
            },
            {
              icon: <FiClock className="h-8 w-8 text-green-500" />,
              title: "Shift & Attendance",
              desc: "Support for Shift 1/2/3 and General shift; auto-calculate effective hours (excluding breaks).",
            },
            {
              icon: <FiUsers className="h-8 w-8 text-cyan-500" />,
              title: "Role-based Access",
              desc: "Hierarchy with Maintenance Head, Department HOD, Shift Workers and General Workers with different permissions.",
            },
            {
              icon: <FiDatabase className="h-8 w-8 text-yellow-500" />,
              title: "Machine Monitoring",
              desc: "Track machine status (running / idle / under maintenance), usage frequency and downtime.",
            },
            {
              icon: <FiBarChart2 className="h-8 w-8 text-cyan-500" />,
              title: "Analytics & Reports",
              desc: "Attendance reports, machine usage analytics, downtime & breakdown analysis and department productivity.",
            },
            {
              icon: <FiLogIn className="h-8 w-8 text-red-500" />,
              title: "Performance Grading",
              desc: "Monthly grading (A–E) based on effective hours vs expected hours to measure workforce performance.",
            },
          ].map((card, i) => (
            <article
              key={i}
              className={`flex flex-col h-full border rounded-2xl p-6 shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl 
                ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white border-gray-200 text-black"
                }
              `}
            >
              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 
              ${darkMode ? "bg-gray-900/50" : "bg-white"}
            `}
              >
                {card.icon}
              </div>

              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>

              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {card.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Detailed Feature Blocks */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
  <div className="space-y-12">

    {/* Routine & Preventive & Predictive */}
    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
      <div
        className={`flex flex-col h-full rounded-xl p-8 border shadow-sm transform transition-all duration-500 hover:translate-y-[-4px] 
          ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 text-black"
          }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center 
              ${darkMode ? "bg-blue-900/20" : "bg-white"}`}
          >
            <FiActivity className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold">Comprehensive Maintenance Logging</h3>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Log routine readings (weight, temperature, pressure), schedule
          preventive work to avoid failure, and record predictive
          calibrations based on sensor trends. Each log can include
          reading_value JSON for sensor data, downtime hours, status and
          timestamps.
        </p>
      </div>

      <div
        className={`flex flex-col h-full rounded-xl p-8 border shadow-sm transform transition-all duration-500 hover:translate-y-[-4px] 
          ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 text-black"
          }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center 
              ${darkMode ? "bg-green-900/20" : "bg-white"}`}
          >
            <FiClock className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold">Shift Management & Attendance</h3>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Support for 3 rotational shifts and General shift. Track
          check-ins/check-outs, link attendance, compute effective hours
          and compare against expected hours for performance.
        </p>
      </div>
    </div>

    {/* Role-based Access & Worker Performance */}
    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
      <div
        className={`flex flex-col h-full rounded-xl p-8 border shadow-sm transform transition-all duration-500 hover:-translate-y-1 
          ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 text-black"
          }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center 
              ${darkMode ? "bg-cyan-900/20" : "bg-white"}`}
          >
            <FiUsers className="h-6 w-6 text-cyan-500" />
          </div>
          <h3 className="text-2xl font-bold">Role-Based Access Control</h3>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Four-level hierarchy with Maintenance Head, Department HOD,
          Shift Workers, and General Workers. Each level has its own
          permissions and visibility.
        </p>
      </div>

      <div
        className={`flex flex-col h-full rounded-xl p-8 border shadow-sm transform transition-all duration-500 hover:-translate-y-1 
          ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 text-black"
          }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center 
              ${darkMode ? "bg-yellow-900/20" : "bg-white"}`}
          >
            <FiBarChart2 className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold">Worker Performance & Grading</h3>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Automatic grading (A–E) based on effective hours vs expected
          hours per month. Helps with appraisals, department comparisons
          and workforce decisions.
        </p>
      </div>
    </div>

    {/* Machine Monitoring & Analytics */}
    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
      <div
        className={`flex flex-col h-full rounded-xl p-8 border shadow-sm transform transition-all duration-500 hover:scale-102 
          ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 text-black"
          }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center 
              ${darkMode ? "bg-indigo-900/20" : "bg-white"}`}
          >
            <FiDatabase className="h-6 w-6 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold">Machine Status & Usage</h3>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Track machine states (running, idle, under maintenance),
          downtime hours, breakdown frequency and usage statistics.
        </p>
      </div>

      <div
        className={`flex flex-col h-full rounded-xl p-8 border shadow-sm transform transition-all duration-500 hover:scale-102 
          ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200 text-black"
          }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center 
              ${darkMode ? "bg-rose-900/20" : "bg-white"}`}
          >
            <FiLogIn className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold">Analytics, Downtime & Productivity</h3>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Analytics for worker attendance, machine performance, downtime,
          department productivity and breakdown trends. Filter by date,
          shift, department or machine.
        </p>
      </div>
    </div>

  </div>
</section>


      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-12 transform transition-all duration-500 hover:-translate-y-1">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to make maintenance predictable?
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Try MaintenanceLog to reduce downtime, measure workforce performance
            and get clear analytics for smarter decisions.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="border border-white/40 text-white px-6 py-3 rounded-lg transition-all hover:bg-white/10"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`border-t py-12 px-6 ${
          darkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-blue-500 p-2 rounded-lg">
                <FiActivity className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold">MaintenanceLog</span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Privacy
              </Link>
              <Link
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Terms
              </Link>
              <Link
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Contact
              </Link>
              <Link
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Docs
              </Link>
            </div>
          </div>

          <div
            className={`mt-8 pt-8 border-t text-center ${
              darkMode
                ? "border-gray-700 text-gray-500"
                : "border-gray-200 text-gray-400"
            }`}
          >
            © {new Date().getFullYear()} MaintenanceLog. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
