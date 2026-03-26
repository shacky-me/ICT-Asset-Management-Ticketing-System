"use client";
import { useState } from "react";

const PreferencesSection = () => {
  const [dateFormat, setDateFormat] = useState("DD MMM, YYYY");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [theme, setTheme] = useState("Light");

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">System Preferences</p>
        <p className="text-xs text-gray-400">Customize your experience</p>
      </div>
      <div className="divide-y divide-gray-100">
        {/* Date format */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Date Format</p>
            <p className="text-xs text-gray-400">
              How dates are displayed across the system
            </p>
          </div>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-gray-50 cursor-pointer"
          >
            <option>DD MMM, YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Timezone</p>
            <p className="text-xs text-gray-400">
              Your local timezone for timestamps
            </p>
          </div>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-gray-50 cursor-pointer"
          >
            <option>Africa/Nairobi</option>
            <option>UTC</option>
            <option>Africa/Lagos</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default PreferencesSection;
