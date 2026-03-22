"use client";
import { useState, useEffect } from "react";

// The open houses are on this date
const EVENT_DATE = new Date(2026, 2, 22); // March 22, 2026

export function useLiveClock(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

function eventTime(h: number, m: number): Date {
  const d = new Date(EVENT_DATE);
  d.setHours(h, m, 0, 0);
  return d;
}

export function isSlotPast(endTime: string, now: Date): boolean {
  const [h, m] = endTime.split(":").map(Number);
  return now > eventTime(h, m);
}

export function isSlotActive(startTime: string, endTime: string, now: Date): boolean {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return now >= eventTime(sh, sm) && now <= eventTime(eh, em);
}
