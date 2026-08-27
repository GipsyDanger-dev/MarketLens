export interface AnalyticsPlace {
  id: string;
  rating: number | null;
  reviewCount: number | null;
}

export interface DistributionBucket {
  label: string;
  count: number;
}

export interface BasicMarketMetrics {
  totalBusinesses: number;
  averageRating: number | null;
  medianRating: number | null;
  averageReviewCount: number | null;
  medianReviewCount: number | null;
  ratingDistribution: DistributionBucket[];
  reviewDistribution: DistributionBucket[];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? round((sorted[middle - 1]! + sorted[middle]!) / 2)
    : sorted[middle]!;
}

function average(values: number[]): number | null {
  return values.length === 0
    ? null
    : round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function distribution(
  values: number[],
  buckets: readonly { label: string; matches: (value: number) => boolean }[],
): DistributionBucket[] {
  return buckets.map(({ label, matches }) => ({
    label,
    count: values.filter(matches).length,
  }));
}

export function calculateBasicMarketMetrics(
  places: readonly AnalyticsPlace[],
): BasicMarketMetrics {
  const ratings = places
    .map((place) => place.rating)
    .filter((rating): rating is number => rating !== null);
  const reviewCounts = places
    .map((place) => place.reviewCount)
    .filter((reviewCount): reviewCount is number => reviewCount !== null);

  return {
    totalBusinesses: places.length,
    averageRating: average(ratings),
    medianRating: median(ratings),
    averageReviewCount: average(reviewCounts),
    medianReviewCount: median(reviewCounts),
    ratingDistribution: distribution(ratings, [
      { label: "0-1", matches: (rating) => rating < 1 },
      { label: "1-2", matches: (rating) => rating >= 1 && rating < 2 },
      { label: "2-3", matches: (rating) => rating >= 2 && rating < 3 },
      { label: "3-4", matches: (rating) => rating >= 3 && rating < 4 },
      { label: "4-5", matches: (rating) => rating >= 4 && rating <= 5 },
    ]),
    reviewDistribution: distribution(reviewCounts, [
      { label: "0", matches: (count) => count === 0 },
      { label: "1-9", matches: (count) => count >= 1 && count < 10 },
      { label: "10-99", matches: (count) => count >= 10 && count < 100 },
      { label: "100-999", matches: (count) => count >= 100 && count < 1_000 },
      { label: "1000+", matches: (count) => count >= 1_000 },
    ]),
  };
}
