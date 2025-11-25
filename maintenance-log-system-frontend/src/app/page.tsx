"use client";
import { useState } from "react";
import { redirect } from "next/navigation";
import {
  FiActivity,
  FiDatabase,
  FiUsers,
  FiSettings,
  FiLogIn,
  FiBarChart2,
} from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "./_components/auth-button";
import Link from "next/link";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  if (activeTab === "dashboard") {
    redirect("/dashboard");
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
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

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          <AuthButton darkMode={darkMode} />
        </div>
      </nav>

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
                <div
                  className={`rounded-lg p-6 border mb-6 ${
                    darkMode
                      ? "bg-gray-900 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div className="text-blue-500 text-sm mb-1">
                        Active Logs
                      </div>
                      <div className="text-2xl font-bold">142</div>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div className="text-green-500 text-sm mb-1">
                        Completed
                      </div>
                      <div className="text-2xl font-bold">328</div>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div className="text-yellow-500 text-sm mb-1">
                        Pending
                      </div>
                      <div className="text-2xl font-bold">24</div>
                    </div>
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
                        className={darkMode ? "text-gray-400" : "text-gray-500"}
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

      <section
        className={`py-20 px-6 ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FiActivity className="h-8 w-8 text-blue-500" />,
                title: "Real-time Monitoring",
                description:
                  "Track maintenance activities as they happen with live updates and notifications.",
              },
              {
                icon: <FiUsers className="h-8 w-8 text-green-500" />,
                title: "Team Collaboration",
                description:
                  "Assign tasks, share notes, and coordinate with your entire maintenance team.",
              },
              {
                icon: <FiSettings className="h-8 w-8 text-purple-500" />,
                title: "Equipment Management",
                description:
                  "Keep detailed records of all equipment and maintenance history.",
              },
              {
                icon: <FiDatabase className="h-8 w-8 text-yellow-500" />,
                title: "Data Analytics",
                description:
                  "Identify trends and optimize your maintenance schedule with powerful insights.",
              },
              {
                icon: <FiBarChart2 className="h-8 w-8 text-cyan-500" />,
                title: "Custom Reports",
                description:
                  "Generate detailed reports tailored to your organization's needs.",
              },
              {
                icon: <FiLogIn className="h-8 w-8 text-red-500" />,
                title: "Secure Access",
                description:
                  "Role-based permissions ensure the right people have the right access.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`border rounded-xl p-8 hover:border-blue-500 transition-colors transform transition-transform duration-300 hover:scale-105 ${
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
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Maintenance Operations?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of industrial teams who trust MaintenanceLog for their
            maintenance tracking needs.
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transition-colors text-lg cursor-pointer shadow-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>

      <footer
        className={`border-t py-12 px-6 ${
          darkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-blue-500 p-2 rounded-lg">
                <FiActivity className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold">MaintenanceLog</span>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Privacy
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Terms
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Contact
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Docs
              </a>
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
