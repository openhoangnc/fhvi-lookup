import type { Hospital } from "../types/hospital";

/**
 * Check if a hospital is open at a specific day and hour
 * @param hospital - The hospital to check
 * @param day - Optional day of week (0 = Monday, 6 = Sunday). If not provided, uses current day.
 * @param hour - Optional hour (0-23). If not provided, uses current hour.
 */
export function isOpenAt(
  hospital: Hospital,
  day?: number,
  hour?: number,
): boolean {
  const now = new Date();

  // Determine the day to check
  let checkDay: number;
  if (day !== undefined) {
    checkDay = day;
  } else {
    // Convert from JS day (0 = Sunday) to our format (0 = Monday)
    const jsDay = now.getDay();
    checkDay = jsDay === 0 ? 6 : jsDay - 1;
  }

  // Determine the hour to check (use middle of the hour for checking)
  const checkHour = hour !== undefined ? hour : now.getHours();
  const checkTimeMinutes = checkHour * 60 + 30; // Use :30 for middle of hour

  if (!hospital.workHours || hospital.workHours.length === 0) {
    return false; // No work hours defined
  }

  for (const wh of hospital.workHours) {
    // Check if the day is in the days array
    if (!wh.days.includes(checkDay)) {
      continue;
    }

    // Check if the time is within any operation hours
    for (const oh of wh.operationHours) {
      const startDate = new Date(oh.startTime);
      const endDate = new Date(oh.endTime);

      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

      if (checkTimeMinutes >= startMinutes && checkTimeMinutes <= endMinutes) {
        return true;
      }
    }
  }

  return false;
  return false;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function searchHospitals(
  hospitals: Hospital[],
  query: string,
): Hospital[] {
  if (!query) return hospitals;

  const lowerQuery = query.toLowerCase();
  const numericQuery = query.replace(/\D/g, "");

  return hospitals.filter((h) => {
    return (
      h.name?.toLowerCase().includes(lowerQuery) ||
      h.engName?.toLowerCase().includes(lowerQuery) ||
      h.address?.toLowerCase().includes(lowerQuery) ||
      h.engAddress?.toLowerCase().includes(lowerQuery) ||
      h.city?.toLowerCase().includes(lowerQuery) ||
      h.engCity?.toLowerCase().includes(lowerQuery) ||
      h.district?.toLowerCase().includes(lowerQuery) ||
      h.engDistrict?.toLowerCase().includes(lowerQuery) ||
      h.category?.toLowerCase().includes(lowerQuery) ||
      h.providerType?.toLowerCase().includes(lowerQuery) ||
      (numericQuery !== "" &&
        h.phoneNumber?.some((p) =>
          p.replace(/\D/g, "").includes(numericQuery),
        )) ||
      h.services?.some(
        (s) =>
          s.name?.toLowerCase().includes(lowerQuery) ||
          s.localName?.toLowerCase().includes(lowerQuery),
      ) ||
      h.appliedBenefitServiceDetails?.some(
        (s) =>
          s.name?.toLowerCase().includes(lowerQuery) ||
          s.localName?.toLowerCase().includes(lowerQuery),
      )
    );
  });
}

export function filterHospitals(
  hospitals: Hospital[],
  filters: {
    country?: string;
    city?: string;
    district?: string;
    category?: string;
    providerType?: string;
    serviceId?: number;
    workDay?: number; // 0-6 (Monday-Sunday)
    workHour?: number; // 0-23
    userLocation?: { latitude: number; longitude: number };
    maxDistance?: number;
  },
): Hospital[] {
  return hospitals.filter((h) => {
    if (
      filters.country &&
      h.country?.toLowerCase() !== filters.country.toLowerCase()
    )
      return false;
    if (filters.city && h.city !== filters.city) return false;
    if (filters.district && h.district !== filters.district) return false;
    if (filters.category && h.category !== filters.category) return false;
    if (filters.providerType && h.providerType !== filters.providerType)
      return false;

    if (filters.serviceId) {
      const allServices = [
        ...(h.services || []),
        ...(h.appliedBenefitServiceDetails || []),
      ];
      if (!allServices.some((s) => s.id === filters.serviceId)) return false;
    }

    // Filter by working hours - only if at least day or hour is specified
    if (filters.workDay !== undefined || filters.workHour !== undefined) {
      if (!isOpenAt(h, filters.workDay, filters.workHour)) return false;
    }

    if (filters.userLocation && filters.maxDistance) {
      if (
        h.geo &&
        h.geo.latitude &&
        h.geo.latitude !== 0 &&
        h.geo.longitude &&
        h.geo.longitude !== 0
      ) {
        const dist = calculateDistance(
          filters.userLocation.latitude,
          filters.userLocation.longitude,
          h.geo.latitude,
          h.geo.longitude,
        );
        if (dist > filters.maxDistance) return false;
      } else {
        return false; // Exclude if no location data when filtering by distance
      }
    }

    return true;
  });
}
