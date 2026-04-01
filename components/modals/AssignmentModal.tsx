"use client";

import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { createPortal } from "react-dom";
import { addNotification } from "@/lib/notifications";
import {
  addAssignment,
  ASSIGNABLE_ASSETS,
  ASSIGNABLE_USERS,
} from "@/lib/assignments";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignmentModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<"asset" | "user">("asset");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [assetSearch, setAssetSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAssets = useMemo(
    () =>
      ASSIGNABLE_ASSETS.filter(
        (asset) =>
          assetSearch === "" ||
          asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
          asset.tag.toLowerCase().includes(assetSearch.toLowerCase()),
      ),
    [assetSearch],
  );

  const filteredUsers = useMemo(
    () =>
      ASSIGNABLE_USERS.filter(
        (user) =>
          userSearch === "" ||
          user.name.toLowerCase().includes(userSearch.toLowerCase()),
      ),
    [userSearch],
  );

  const handleReset = () => {
    setStep("asset");
    setSelectedAsset("");
    setSelectedUser("");
    setAssetSearch("");
    setUserSearch("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAssetSelect = (tag: string) => {
    setSelectedAsset(tag);
    setStep("user");
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleSubmit = async () => {
    if (!selectedAsset || !selectedUser) return;

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));

      const asset = ASSIGNABLE_ASSETS.find((a) => a.tag === selectedAsset);
      const user = ASSIGNABLE_USERS.find((u) => u.id === selectedUser);

      if (!asset || !user) {
        setIsSubmitting(false);
        return;
      }

      addAssignment({
        assetTag: asset.tag,
        assetName: asset.name,
        assignedTo: user.name,
        department: user.department,
      });

      addNotification({
        title: "Device assigned",
        message: `${asset.name} (${selectedAsset}) assigned to ${user.name}.`,
        type: "asset",
      });

      handleReset();
      onClose();
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {step === "asset" ? "Select Device" : "Assign to User"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === "asset"
                ? "Choose an available device from IT inventory"
                : `Assign ${ASSIGNABLE_ASSETS.find((a) => a.tag === selectedAsset)?.name} to a team member`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === "asset" ? (
            <div className="p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by device name or asset tag..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {/* Asset List */}
              <div className="space-y-2">
                {filteredAssets.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">
                      No devices match your search
                    </p>
                  </div>
                ) : (
                  filteredAssets.map((asset) => (
                    <button
                      key={asset.tag}
                      onClick={() => handleAssetSelect(asset.tag)}
                      className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                            {asset.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {asset.tag}
                            </span>
                            <span className="text-xs text-slate-500">
                              {asset.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                          Select →
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {/* User List */}
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">
                      No users match your search
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedUser === user.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-white">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedUser === user.id
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}
                        >
                          {selectedUser === user.id && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3 bg-gray-50">
          {step === "user" && (
            <button
              onClick={() => {
                setStep("asset");
                setSelectedUser("");
                setUserSearch("");
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
          )}
          {step === "asset" && <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {step === "user" && (
              <button
                onClick={handleSubmit}
                disabled={!selectedUser || isSubmitting}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Assigning..." : "Assign Device"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
