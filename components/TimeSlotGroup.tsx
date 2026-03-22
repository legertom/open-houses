"use client";
import type { Listing } from "@/lib/types";
import ListingCard from "./ListingCard";

interface TimeSlotGroupProps {
  timeSlot: string;
  listings: Listing[];
  isActive: boolean;
  getNote: (id: string) => string;
  updateNote: (id: string, text: string) => void;
}

export default function TimeSlotGroup({
  timeSlot,
  listings,
  isActive,
  getNote,
  updateNote,
}: TimeSlotGroupProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 mb-2">
        <h2 className="text-sm font-semibold text-gray-900">{timeSlot}</h2>
        {isActive && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
            NOW
          </span>
        )}
        <span className="text-xs text-gray-400">
          {listings.length} listing{listings.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-col gap-3 px-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            note={getNote(listing.id)}
            onNoteChange={(text) => updateNote(listing.id, text)}
          />
        ))}
      </div>
    </div>
  );
}
