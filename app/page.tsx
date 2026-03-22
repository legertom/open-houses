"use client";
import { useState, useMemo } from "react";
import listings from "@/data/listings.json";
import type { Listing } from "@/lib/types";
import { useLiveClock, isSlotPast, isSlotActive } from "@/hooks/useLiveClock";
import { useNotes } from "@/hooks/useNotes";
import Header from "@/components/Header";
import ViewToggle from "@/components/ViewToggle";
import TimeSlotGroup from "@/components/TimeSlotGroup";
import PastSlotGroup from "@/components/PastSlotGroup";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const typedListings = listings as Listing[];

interface SlotGroup {
  timeSlot: string;
  startTime: string;
  endTime: string;
  listings: Listing[];
}

function groupByTimeSlot(items: Listing[]): SlotGroup[] {
  const map = new Map<string, SlotGroup>();
  for (const l of items) {
    if (!map.has(l.timeSlot)) {
      map.set(l.timeSlot, {
        timeSlot: l.timeSlot,
        startTime: l.startTime,
        endTime: l.endTime,
        listings: [],
      });
    }
    map.get(l.timeSlot)!.listings.push(l);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
}

export default function Home() {
  const [view, setView] = useState<"schedule" | "map">("schedule");
  const now = useLiveClock();
  const { getNote, updateNote } = useNotes();

  const allSlots = useMemo(() => groupByTimeSlot(typedListings), []);

  const { activeSlots, pastSlots, pastIds } = useMemo(() => {
    const active: SlotGroup[] = [];
    const past: SlotGroup[] = [];
    const pIds = new Set<string>();

    for (const slot of allSlots) {
      if (isSlotPast(slot.endTime, now)) {
        past.push(slot);
        slot.listings.forEach((l) => pIds.add(l.id));
      } else {
        active.push(slot);
      }
    }
    return { activeSlots: active, pastSlots: past, pastIds: pIds };
  }, [allSlots, now]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="sticky top-0 z-10 bg-gray-50 pb-1">
        <ViewToggle activeView={view} onToggle={setView} />
      </div>

      {view === "schedule" ? (
        <div className="flex-1 pb-8">
          {activeSlots.length === 0 && pastSlots.length > 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500 text-sm">
                All open houses are done for today!
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Expand the Past section below to review your notes.
              </p>
            </div>
          )}

          {activeSlots.map((slot) => (
            <TimeSlotGroup
              key={slot.timeSlot}
              timeSlot={slot.timeSlot}
              listings={slot.listings}
              isActive={isSlotActive(slot.startTime, slot.endTime, now)}
              getNote={getNote}
              updateNote={updateNote}
            />
          ))}

          <PastSlotGroup
            slots={pastSlots}
            getNote={getNote}
            updateNote={updateNote}
          />
        </div>
      ) : (
        <MapView listings={typedListings} pastIds={pastIds} />
      )}
    </div>
  );
}
