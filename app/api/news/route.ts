import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=India+politics+parliament+politician&lang=en&country=in&max=10&apikey=193be28d502ec79048f750f819fb69d5`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
