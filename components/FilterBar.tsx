"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { PRODUCT_TYPE_GROUPS, getUngroupedTypes, findMatchingTypesInGroup } from "@/config/productTypeGroups";

interface FilterBarProps {
  products: Product[];
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
}

export const FilterBar = ({
  products,
  selectedTypes,
  onTypeChange,
}: FilterBarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const allProductTypes = Array.from(new Set(products.map((p) => p.product_type))).sort();
  const ungroupedTypes = getUngroupedTypes(allProductTypes);

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Filter groups to only show those with types that exist in products (case-insensitive)
  const availableGroups = PRODUCT_TYPE_GROUPS.map((group) => {
    const matchingTypes = findMatchingTypesInGroup(group.types, allProductTypes);
    return { ...group, matchingTypes };
  }).filter((group) => group.matchingTypes.length > 0);

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">Filter by Type</h3>
        <div className="space-y-3">
          {availableGroups.map((group) => {
            const groupTypes = group.matchingTypes;
            if (groupTypes.length === 0) return null;
            
            const isExpanded = expandedGroups.has(group.name);
            const hasSelected = groupTypes.some((type) => selectedTypes.includes(type));

            return (
              <div key={group.name} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="flex w-full items-center justify-between text-left transition-colors hover:text-gray-900"
                  aria-expanded={isExpanded}
                >
                  <span className={`text-sm font-medium transition-colors ${hasSelected ? "text-gray-900" : "text-gray-700"}`}>
                    {group.name}
                    <span className="ml-2 text-xs font-normal text-gray-500">({groupTypes.length})</span>
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-all duration-200 ${isExpanded ? "rotate-180 text-gray-600" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {groupTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleTypeToggle(type)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${
                          selectedTypes.includes(type)
                            ? "bg-gray-900 text-white shadow-sm"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {ungroupedTypes.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Other</h4>
              <div className="flex flex-wrap gap-2">
                {ungroupedTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${
                      selectedTypes.includes(type)
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTypes.length > 0 && (
        <button
          onClick={() => {
            onTypeChange([]);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

