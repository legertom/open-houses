export interface Listing {
  id: string;
  address: string;
  unit: string;
  neighborhood: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  priceK: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  rooms: number | null;
  propertyType: string;
  commonCharges: string | null;
  taxes: string | null;
  monthlyCost: string | null;
  description: string;
  features: string[];
  amenities: string[];
  petsAllowed: boolean | null;
  imageUrl: string;
  streetEasyUrl: string;
  lat: number;
  lng: number;
}

export interface ListingNote {
  listingId: string;
  text: string;
  updatedAt: string;
}
