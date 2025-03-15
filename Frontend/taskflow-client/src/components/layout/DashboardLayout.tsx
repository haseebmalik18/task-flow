import React, { useState } from "react";
import { useAuth } from "../../components/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#f8fafc]">
      <div
        className={`bg-white shadow-md fixed h-full md:relative z-30 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ width: "240px" }}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#2563eb]">TaskFlow</h1>
        </div>

        <nav className="mt-5 px-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Boards
          </h2>
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-[#1e293b] rounded-md bg-[#2563eb]/10 font-medium"
            >
              <svg
                className="h-5 w-5 mr-2 text-[#2563eb]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
              </svg>
              All Boards
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-[#1e293b] rounded-md hover:bg-gray-100"
            >
              <svg
                className="h-5 w-5 mr-2 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Starred
            </a>
          </div>

          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
            Workspaces
          </h2>
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-[#1e293b] rounded-md hover:bg-gray-100"
            >
              <div className="h-5 w-5 mr-2 bg-indigo-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              Personal
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-[#1e293b] rounded-md hover:bg-gray-100"
            >
              <div className="h-5 w-5 mr-2 bg-green-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                W
              </div>
              Work
            </a>
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="relative md:ml-4 md:flex-1 max-w-md hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center">
              <button className="p-1 ml-4 text-gray-500 rounded-full hover:bg-gray-100">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="ml-4 flex items-center text-sm font-medium text-gray-700 hover:text-[#2563eb]"
              >
                <div className="h-8 w-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-bold mr-2">
                  {user && user.firstName ? user.firstName.charAt(0) : "U"}
                </div>
                <span className="hidden md:block">
                  {user && user.firstName ? user.firstName : "User"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
