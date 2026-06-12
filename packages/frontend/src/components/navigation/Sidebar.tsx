"use JSX";
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Plus,
  LayoutDashboard,
  Users,
  FileText,
  Sliders, // 💡 Imported for blueprint configurations mapping
  Library,
  Settings,
} from "lucide-react";

interface SidebarProps {
  schoolName?: string;
  location?: string;
  avatarUrl?: string;
}

export default function Sidebar({
  schoolName = "Delhi Public School",
  location = "Bokaro Steel City",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
}: SidebarProps) {
  const pathname = usePathname();

  // 💡 NAVIGATION BLUEPRINT UPDATED: Swapped old toolkit for custom patterns workspace
  const navItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Groups", href: "/groups", icon: Users },
    {
      label: "Assignments",
      href: "/assignments",
      icon: FileText,
      badgeCount: 10,
    },
    { 
      label: "Paper Patterns", 
      href: "/patterns", 
      icon: Sliders 
    }, // 🛠️ NEW: Custom template designer workspace hook
    { label: "My Library", href: "/library", icon: Library },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 font-sans print:hidden shrink-0">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">
            Assessment<span className="text-indigo-600">AI</span>
          </span>
        </div>

        <Link
          href="/create"
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] border border-slate-800"
        >
          <Plus className="h-4 w-4 stroke-3" /> Create Assignment
        </Link>

        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-slate-900" : "text-slate-400"}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badgeCount && (
                  <span className="h-5 px-1.5 min-w-5 bg-orange-500 text-white font-bold text-[11px] rounded-full flex items-center justify-center shadow-sm shadow-orange-100">
                    {item.badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
            pathname === "/settings"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"
          }`}
        >
          <Settings className="h-5 w-5 text-slate-400" />
          <span>Settings</span>
        </Link>

        <div className="h-px bg-slate-100 mx-2" />

        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
          <img
            src={avatarUrl}
            alt={schoolName}
            className="h-10 w-10 rounded-xl object-cover border border-slate-200/60 shadow-inner"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-slate-900 truncate tracking-wide">
              {schoolName}
            </h4>
            <p className="text-[11px] font-bold text-slate-400 truncate tracking-wide mt-0.5">
              {location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}