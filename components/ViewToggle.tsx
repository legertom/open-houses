"use client";

interface ViewToggleProps {
  activeView: "schedule" | "map";
  onToggle: (view: "schedule" | "map") => void;
}

export default function ViewToggle({ activeView, onToggle }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mx-4 my-2">
      <button
        onClick={() => onToggle("schedule")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
          activeView === "schedule"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500"
        }`}
      >
        Schedule
      </button>
      <button
        onClick={() => onToggle("map")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
          activeView === "map"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500"
        }`}
      >
        Map
      </button>
    </div>
  );
}
