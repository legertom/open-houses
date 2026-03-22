"use client";
import { useState } from "react";
import type { Listing } from "@/lib/types";
import NoteEditor from "./NoteEditor";

interface ListingCardProps {
  listing: Listing;
  note: string;
  onNoteChange: (text: string) => void;
  isPast?: boolean;
}

export default function ListingCard({ listing, note, onNoteChange, isPast }: ListingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${listing.address} ${listing.unit}, Brooklyn, NY`
  )}`;

  const bedsLabel =
    listing.beds === 0
      ? "Studio"
      : listing.beds
      ? `${listing.beds}bd`
      : null;
  const bathsLabel = listing.baths ? `${listing.baths}ba` : null;
  const detailParts = [bedsLabel, bathsLabel].filter(Boolean).join("/");
  const sqftLabel = listing.sqft ? `${listing.sqft} sqft` : null;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-opacity ${
        isPast ? "opacity-60 border-gray-200" : "border-gray-200"
      }`}
    >
      {/* Image + basic info */}
      <div className="flex cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {listing.imageUrl && (
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={listing.imageUrl}
              alt={`${listing.address} #${listing.unit}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {listing.address} #{listing.unit}
              </h3>
              <p className="text-xs text-gray-500">{listing.neighborhood}</p>
            </div>
            <span className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">
              ${listing.priceK}K
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-gray-600">
            {listing.propertyType && <span>{listing.propertyType}</span>}
            {detailParts && <span>{detailParts}</span>}
            {sqftLabel && <span>{sqftLabel}</span>}
          </div>
          {listing.commonCharges && (
            <p className="text-xs text-gray-400 mt-0.5">
              {listing.commonCharges}
              {listing.taxes ? ` + ${listing.taxes} tax` : ""}
            </p>
          )}
          {note && !expanded && (
            <p className="text-xs text-blue-600 mt-1 truncate">📝 {note}</p>
          )}
        </div>
        <div className="flex items-center pr-3">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-medium py-2 px-3 rounded-lg
                         bg-blue-600 text-white active:bg-blue-700"
            >
              Directions
            </a>
            <a
              href={listing.streetEasyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-medium py-2 px-3 rounded-lg
                         border border-gray-300 text-gray-700 active:bg-gray-50"
            >
              View Listing
            </a>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              {listing.description}
            </p>
          )}

          {/* Features */}
          {listing.features.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-500 mb-1">Features</h4>
              <div className="flex flex-wrap gap-1">
                {listing.features.map((f) => (
                  <span
                    key={f}
                    className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-500 mb-1">Amenities</h4>
              <div className="flex flex-wrap gap-1">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Monthly cost */}
          {listing.monthlyCost && (
            <p className="text-xs text-gray-500 mt-3">
              Est. monthly: <span className="font-medium text-gray-700">{listing.monthlyCost}</span>
            </p>
          )}

          {/* Notes */}
          <NoteEditor value={note} onChange={onNoteChange} />
        </div>
      )}
    </div>
  );
}
