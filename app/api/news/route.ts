import { NextResponse } from "next/server";

export async function GET() {
  try {
    const queries = [
      "India+parliament+politics",
      "India+BJP+INC+AAP+politician",
      "India+election+government+2025",
      "India+Modi+parliament+news",
    ];

    const results = await Promise.all(
      queries.map(q =>
        fetch(
          `https://gnews.io/api/v4/search?q=${q}&lang=en&country=in&max=4&sortby=publishedAt&apikey=193be28d502ec79048f750f819fb69d5`,
          { next: { revalidate: 1800 } }
        ).then(r => r.json())
      )
    );

    const articles = results
      .flatMap(r => r.articles || [])
      .filter((a, i, arr) => arr.findIndex(b => b.title === a.title) === i)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 15);

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
