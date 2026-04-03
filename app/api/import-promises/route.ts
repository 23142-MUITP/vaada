import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

async function generatePromises(politician: { id: string; name: string; party: string; role: string; state: string }) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Generate 5 real political promises made by ${politician.name}, ${politician.role} from ${politician.party} party in ${politician.state}. 
        
        Return ONLY a JSON array with no extra text:
        [
          {
            "title": "Short promise title",
            "description": "Detailed description of the promise",
            "category": "one of: Infrastructure/Economy/Healthcare/Education/Agriculture/Security/Environment/Employment/Welfare/Other",
            "status": "one of: Kept/In Progress/Broken",
            "year_made": year as number,
            "source": "manifesto or speech reference"
          }
        ]`
      }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";
  
  try {
    const cleaned = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5");

  try {
    // Get politicians with no promises yet
    const { data: politicians } = await supabase
      .from("politicians")
      .select("id, name, party, role, state")
      .eq("total_promises", 0)
      .limit(limit);

    if (!politicians || politicians.length === 0) {
      return NextResponse.json({ success: true, message: "All politicians already have promises", processed: 0 });
    }

    let totalAdded = 0;

    for (const politician of politicians) {
      const promises = await generatePromises(politician);
      
      if (promises.length === 0) continue;

      // Insert promises
      for (const promise of promises) {
        await supabase.from("promises").insert({
          politician_id: politician.id,
          politician_name: politician.name,
          title: promise.title,
          description: promise.description,
          category: promise.category || "Other",
          status: promise.status || "In Progress",
          year_made: promise.year_made || 2024,
          source: promise.source || "Public records",
        });
        totalAdded++;
      }

      // Update politician promise counts
      const kept = promises.filter((p: {status: string}) => p.status === "Kept").length;
      const progress = promises.filter((p: {status: string}) => p.status === "In Progress").length;
      const broken = promises.filter((p: {status: string}) => p.status === "Broken").length;

      await supabase.from("politicians").update({
        promises_kept: kept,
        promises_progress: progress,
        promises_broken: broken,
        total_promises: promises.length,
      }).eq("id", politician.id);
    }

    return NextResponse.json({
      success: true,
      processed: politicians.length,
      promises_added: totalAdded,
      message: `Generated ${totalAdded} promises for ${politicians.length} politicians.`
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
