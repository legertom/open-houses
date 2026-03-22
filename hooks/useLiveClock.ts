"use client";
import { useState, useEffect } from "react";

export function useLiveClock(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export function isSlotPast(endTime: string, now: Date): boolean {
  const [h, m] = endTime.split(":").map(Number);
  const end = new Date(now);
  end.setHours(h, m, 0, 0);
  return now > end;
}

export function isSlotActive(startTime: string, endTime: string, now: Date): boolean {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);
  return now >= start && now <= end;
}
