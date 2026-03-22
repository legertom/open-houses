"use client";
import { useEffect, useRef } from "react";
import type { Listing } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  listings: Listing[];
  pastIds: Set<string>;
}

export default function MapView({ listings, pastIds }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const bounds: L.LatLngExpression[] = [];

    listings.forEach((listing) => {
      const isPast = pastIds.has(listing.id);
      const pos: L.LatLngExpression = [listing.lat, listing.lng];
      bounds.push(pos);

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: ${isPast ? "#9ca3af" : "#2563eb"};
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">$${listing.priceK}K</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(pos, { icon }).addTo(map);

      marker.bindPopup(
        `<div style="font-family: system-ui; min-width: 160px;">
          <strong style="font-size: 13px;">${listing.address} #${listing.unit}</strong><br/>
          <span style="font-size: 12px; color: #666;">${listing.timeSlot}</span><br/>
          <span style="font-size: 13px; font-weight: 600;">$${listing.priceK}K</span>
          ${listing.beds !== null ? `<span style="font-size: 12px; color: #666;"> · ${listing.beds === 0 ? "Studio" : listing.beds + "bd"}/${listing.baths}ba</span>` : ""}
          <br/>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            listing.address + " " + listing.unit + ", Brooklyn, NY"
          )}" target="_blank" style="font-size: 12px; color: #2563eb; text-decoration: none;">
            Get Directions →
          </a>
        </div>`,
        { closeButton: false }
      );
    });

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [listings, pastIds]);

  return (
    <div
      ref={mapRef}
      className="flex-1 w-full"
      style={{ minHeight: "calc(100vh - 120px)" }}
    />
  );
}
