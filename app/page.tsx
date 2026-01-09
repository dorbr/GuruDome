
import { Guru } from '@/lib/models';
import connectToDatabase from '@/lib/db';
import HomeContent from './components/HomeContent';

interface SearchParams {
  q?: string;
  category?: string;
  minRating?: string;
  maxRating?: string;
  sort?: string;
}

async function getGurus(params: SearchParams) {
  await connectToDatabase();

  // Build filter
  const filter: Record<string, unknown> = {};
  const conditions: Record<string, unknown>[] = [];

  // Text search
  if (params.q) {
    conditions.push(
      { name: { $regex: params.q, $options: "i" } },
      { instagramUrl: { $regex: params.q, $options: "i" } },
      { "socialHandles.twitter": { $regex: params.q, $options: "i" } }
    );
    filter.$or = conditions;
  }

  // Category filter
  if (params.category) {
    filter.category = params.category;
  }

  // Rating filters
  if (params.minRating) {
    filter["ratingStats.averageRating"] = {
      ...((filter["ratingStats.averageRating"] as Record<string, unknown>) || {}),
      $gte: parseFloat(params.minRating)
    };
  }
  if (params.maxRating) {
    filter["ratingStats.averageRating"] = {
      ...((filter["ratingStats.averageRating"] as Record<string, unknown>) || {}),
      $lt: parseFloat(params.maxRating)
    };
  }

  // Build sort
  let sortOptions: Record<string, 1 | -1> = { "ratingStats.averageRating": -1 };
  switch (params.sort) {
    case "reviews":
      sortOptions = { "ratingStats.totalReviews": -1 };
      break;
    case "newest":
      sortOptions = { createdAt: -1 };
      break;
    case "name":
      sortOptions = { name: 1 };
      break;
    case "rating":
    default:
      sortOptions = { "ratingStats.averageRating": -1 };
  }

  const gurus = await Guru.find(filter).sort(sortOptions).limit(20);
  return JSON.parse(JSON.stringify(gurus));
}

async function getExperts() {
  await connectToDatabase();
  // Experts: Sort by rating (desc), ensure they have ratings
  const gurus = await Guru.find({ "ratingStats.averageRating": { $gte: 4 } })
    .sort({ "ratingStats.averageRating": -1, "ratingStats.totalReviews": -1 })
    .limit(4);
  return JSON.parse(JSON.stringify(gurus));
}

async function getScammers() {
  await connectToDatabase();
  // Scammers: Sort by rating (asc), limit to rating < 3
  const gurus = await Guru.find({ "ratingStats.averageRating": { $lt: 3, $gt: 0 } })
    .sort({ "ratingStats.averageRating": 1, "ratingStats.totalReviews": -1 })
    .limit(4);
  return JSON.parse(JSON.stringify(gurus));
}

async function getTrendingGurus() {
  await connectToDatabase();
  // Trending: Sort by createdAt (desc)
  const gurus = await Guru.find({})
    .sort({ createdAt: -1 })
    .limit(4);
  return JSON.parse(JSON.stringify(gurus));
}

export default async function Home(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const hasFilters = searchParams?.category || searchParams?.minRating || searchParams?.maxRating;
  const isSearching = query || hasFilters;

  let gurus = [];
  let experts = [];
  let scammers = [];
  let trending = [];

  if (isSearching) {
    gurus = await getGurus(searchParams || {});
  } else {
    experts = await getExperts();
    scammers = await getScammers();
    trending = await getTrendingGurus();
  }

  return (
    <HomeContent
      gurus={gurus}
      experts={experts}
      scammers={scammers}
      trending={trending}
      isSearching={!!isSearching}
      query={query}
    />
  );
}
