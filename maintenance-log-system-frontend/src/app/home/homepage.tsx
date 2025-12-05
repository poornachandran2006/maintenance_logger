"use client";

import { useState } from "react";
import {
  FiActivity,
  FiDatabase,
  FiUsers,
  FiSettings,
  FiLogIn,
  FiBarChart2,
} from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "../_components/auth-button";
import Link from "next/link";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

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
        {/* LOGO + NAV LINKS */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FiActivity className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              MaintenanceLog
            </span>
          </div>

          {/* LINKS */}
          <div className="hidden md:flex space-x-6">
            <button
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
            </button>

            <Link
              href="/features"
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

            <button
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
            </button>
          </div>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center space-x-4">
          {/* DARK MODE TOGGLE */}
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

          {/* DASHBOARD BUTTON */}
          <button
            className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          {/* LOGIN / PROFILE BUTTON */}
          <AuthButton darkMode={darkMode} />
        </div>
      </nav>

      {/* MAIN HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Industrial Maintenance
              </span>
              <br />
              Made Simple
            </h1>
            <p
              className={`text-xl mb-8 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Track, manage, and optimize your maintenance operations with our
              powerful logging system designed for industrial teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg shadow-lg shadow-blue-500/20">
                Get Started Free
              </button>
              <button
                className={`border px-8 py-4 rounded-lg font-medium cursor-pointer transition-colors text-lg ${
                  darkMode
                    ? "border-gray-600 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Mock UI Section */}
          <div className="lg:w-1/2 relative">
            <div
              className={`border rounded-2xl p-6 shadow-2xl ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700 backdrop-blur-md"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl opacity-20 blur ${
                  darkMode ? "" : "opacity-10"
                }`}
              ></div>

              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>

                  <div
                    className={`ml-auto text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    MaintenanceLog v2.0
                  </div>
                </div>

                {/* Stats */}
                <div
                  className={`rounded-lg p-6 border mb-6 ${
                    darkMode
                      ? "bg-gray-900 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { title: "Active Logs", count: 142, color: "text-blue-500" },
                      { title: "Completed", count: 328, color: "text-green-500" },
                      { title: "Pending", count: 24, color: "text-yellow-500" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <div className={`${item.color} text-sm mb-1`}>
                          {item.title}
                        </div>
                        <div className="text-2xl font-bold">{item.count}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`h-48 rounded-lg flex items-center justify-center ${
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <div className="text-center">
                      <FiDatabase
                        className={`h-12 w-12 mx-auto mb-2 ${
                          darkMode ? "text-gray-600" : "text-gray-400"
                        }`}
                      />
                      <p
                        className={
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }
                      >
                        Maintenance Analytics
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        className={`py-20 px-6 ${
          darkMode ? "bg-gray-800/30" : "bg-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Powerful Maintenance Tracking
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Comprehensive features designed for industrial maintenance teams
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FiActivity className="h-8 w-8 text-blue-500" />,
                title: "Real-time Monitoring",
                description:
                  "Track maintenance activities as they happen with live updates.",
              },
              {
                icon: <FiUsers className="h-8 w-8 text-green-500" />,
                title: "Team Collaboration",
                description:
                  "Assign tasks, share notes, and coordinate with teams.",
              },
              {
                icon: <FiSettings className="h-8 w-8 text-purple-500" />,
                title: "Equipment Management",
                description:
                  "Maintain detailed equipment records and maintenance logs.",
              },
              {
                icon: <FiDatabase className="h-8 w-8 text-yellow-500" />,
                title: "Data Analytics",
                description:
                  "Identify patterns and optimize your maintenance workflow.",
              },
              {
                icon: <FiBarChart2 className="h-8 w-8 text-cyan-500" />,
                title: "Custom Reports",
                description:
                  "Generate reports tailored to your organization's needs.",
              },
              {
                icon: <FiLogIn className="h-8 w-8 text-red-500" />,
                title: "Secure Access",
                description:
                  "Role-based permissions for maximum security.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`border rounded-xl p-8 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${
                    darkMode ? "bg-gray-900/50" : "bg-gray-100"
                  }`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p
                  className={darkMode ? "text-gray-400" : "text-gray-600"}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Maintenance Operations?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of industrial teams who trust MaintenanceLog.
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transition-colors text-lg cursor-pointer shadow-lg">
            Start Your Free Trial
          </button>
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
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} MaintenanceLog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
