import { NextResponse } from "next/server";

export async function GET() {
  try {
    const queries = [
      "India+parliament+politics",
      "India+politician+BJP+INC",
      "India+election+2025",
    ];

    const results = await Promise.all(
      queries.map(q =>
        fetch(
          `https://gnews.io/api/v4/search?q=${q}&lang=en&country=in&max=4&apikey=193be28d502ec79048f750f819fb69d5`,
          { next: { revalidate: 3600 } }
        ).then(r => r.json())
      )
    );

    const articles = results
      .flatMap(r => r.articles || [])
      .filter((a, i, arr) => arr.findIndex(b => b.title === a.title) === i)
      .slice(0, 15);

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
