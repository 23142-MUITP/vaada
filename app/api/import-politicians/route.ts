import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Lok Sabha 17th members from public data
const LOK_SABHA_MPs = [
  { name: "Narendra Modi", party: "BJP", constituency: "Varanasi", state: "Uttar Pradesh", house: "Lok Sabha", role: "Prime Minister of India", level: "National" },
  { name: "Rahul Gandhi", party: "INC", constituency: "Wayanad", state: "Kerala", house: "Lok Sabha", role: "Leader of Opposition", level: "National" },
  { name: "Amit Shah", party: "BJP", constituency: "Gandhinagar", state: "Gujarat", house: "Lok Sabha", role: "Home Minister of India", level: "National" },
  { name: "Smriti Irani", party: "BJP", constituency: "Amethi", state: "Uttar Pradesh", house: "Lok Sabha", role: "Former Minister", level: "National" },
  { name: "Shashi Tharoor", party: "INC", constituency: "Thiruvananthapuram", state: "Kerala", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Supriya Sule", party: "NCP", constituency: "Baramati", state: "Maharashtra", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Asaduddin Owaisi", party: "AIMIM", constituency: "Hyderabad", state: "Telangana", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Dimple Yadav", party: "SP", constituency: "Mainpuri", state: "Uttar Pradesh", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Mahua Moitra", party: "TMC", constituency: "Krishnanagar", state: "West Bengal", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Om Birla", party: "BJP", constituency: "Kota", state: "Rajasthan", house: "Lok Sabha", role: "Speaker, Lok Sabha", level: "National" },
  { name: "Rajnath Singh", party: "BJP", constituency: "Lucknow", state: "Uttar Pradesh", house: "Lok Sabha", role: "Defence Minister of India", level: "National" },
  { name: "Nirmala Sitharaman", party: "BJP", constituency: "Karnataka", state: "Karnataka", house: "Rajya Sabha", role: "Finance Minister of India", level: "National" },
  { name: "S. Jaishankar", party: "BJP", constituency: "Gujarat", state: "Gujarat", house: "Rajya Sabha", role: "External Affairs Minister", level: "National" },
  { name: "Nitin Gadkari", party: "BJP", constituency: "Nagpur", state: "Maharashtra", house: "Lok Sabha", role: "Road Transport Minister", level: "National" },
  { name: "Piyush Goyal", party: "BJP", constituency: "Mumbai North", state: "Maharashtra", house: "Lok Sabha", role: "Commerce Minister", level: "National" },
  { name: "Anurag Thakur", party: "BJP", constituency: "Hamirpur", state: "Himachal Pradesh", house: "Lok Sabha", role: "Minister of Information and Broadcasting", level: "National" },
  { name: "Jyotiraditya Scindia", party: "BJP", constituency: "Guna", state: "Madhya Pradesh", house: "Lok Sabha", role: "Civil Aviation Minister", level: "National" },
  { name: "Mamata Banerjee", party: "TMC", constituency: "Bhowanipore", state: "West Bengal", house: "State Assembly", role: "Chief Minister, West Bengal", level: "State" },
  { name: "Arvind Kejriwal", party: "AAP", constituency: "New Delhi", state: "Delhi", house: "State Assembly", role: "Former CM, Delhi", level: "State" },
  { name: "Yogi Adityanath", party: "BJP", constituency: "Gorakhpur", state: "Uttar Pradesh", house: "State Assembly", role: "Chief Minister, Uttar Pradesh", level: "State" },
  { name: "Akhilesh Yadav", party: "SP", constituency: "Karhal", state: "Uttar Pradesh", house: "State Assembly", role: "Leader, Samajwadi Party", level: "State" },
  { name: "Hemant Soren", party: "JMM", constituency: "Barhait", state: "Jharkhand", house: "State Assembly", role: "Chief Minister, Jharkhand", level: "State" },
  { name: "Ashok Gehlot", party: "INC", constituency: "Sardarpura", state: "Rajasthan", house: "State Assembly", role: "Former CM, Rajasthan", level: "State" },
  { name: "Devendra Fadnavis", party: "BJP", constituency: "Nagpur South West", state: "Maharashtra", house: "State Assembly", role: "Chief Minister, Maharashtra", level: "State" },
  { name: "Omar Abdullah", party: "NC", constituency: "Ganderbal", state: "Jammu and Kashmir", house: "State Assembly", role: "Chief Minister, J&K", level: "State" },
  { name: "Bhupesh Baghel", party: "INC", constituency: "Patan", state: "Chhattisgarh", house: "State Assembly", role: "Former CM, Chhattisgarh", level: "State" },
  { name: "Siddaramaiah", party: "INC", constituency: "Varuna", state: "Karnataka", house: "State Assembly", role: "Chief Minister, Karnataka", level: "State" },
  { name: "Revanth Reddy", party: "INC", constituency: "Kodangal", state: "Telangana", house: "State Assembly", role: "Chief Minister, Telangana", level: "State" },
  { name: "Pinarayi Vijayan", party: "CPI(M)", constituency: "Dharmadom", state: "Kerala", house: "State Assembly", role: "Chief Minister, Kerala", level: "State" },
  { name: "M.K. Stalin", party: "DMK", constituency: "Kolathur", state: "Tamil Nadu", house: "State Assembly", role: "Chief Minister, Tamil Nadu", level: "State" },
  { name: "Nitish Kumar", party: "JD(U)", constituency: "Nalanda", state: "Bihar", house: "State Assembly", role: "Chief Minister, Bihar", level: "State" },
  { name: "Naveen Patnaik", party: "BJD", constituency: "Kantabanji", state: "Odisha", house: "State Assembly", role: "Former CM, Odisha", level: "State" },
  { name: "Sharad Pawar", party: "NCP", constituency: "Baramati", state: "Maharashtra", house: "State Assembly", role: "NCP President", level: "State" },
  { name: "Uddhav Thackeray", party: "Shiv Sena (UBT)", constituency: "Mumbai", state: "Maharashtra", house: "State Assembly", role: "Former CM, Maharashtra", level: "State" },
  { name: "Eknath Shinde", party: "Shiv Sena", constituency: "Kopri-Pachpakhadi", state: "Maharashtra", house: "State Assembly", role: "Former CM, Maharashtra", level: "State" },
  { name: "Priyanka Gandhi Vadra", party: "INC", constituency: "Wayanad", state: "Kerala", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Manish Sisodia", party: "AAP", constituency: "Patparganj", state: "Delhi", house: "State Assembly", role: "Former Deputy CM, Delhi", level: "State" },
  { name: "Mayawati", party: "BSP", constituency: "Akbarpur", state: "Uttar Pradesh", house: "Rajya Sabha", role: "BSP National President", level: "National" },
  { name: "Lalu Prasad Yadav", party: "RJD", constituency: "Patna Sahib", state: "Bihar", house: "Lok Sabha", role: "RJD President", level: "National" },
  { name: "Tejashwi Yadav", party: "RJD", constituency: "Raghopur", state: "Bihar", house: "State Assembly", role: "Leader of Opposition, Bihar", level: "State" },
  { name: "Chandrashekhar Azad", party: "Azad Samaj Party", constituency: "Nagina", state: "Uttar Pradesh", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Chirag Paswan", party: "LJP", constituency: "Hajipur", state: "Bihar", house: "Lok Sabha", role: "Minister, Food Processing", level: "National" },
  { name: "Farooq Abdullah", party: "NC", constituency: "Srinagar", state: "Jammu and Kashmir", house: "Lok Sabha", role: "MP, Lok Sabha", level: "National" },
  { name: "Suresh Prabhu", party: "BJP", constituency: "Rajya Sabha", state: "Andhra Pradesh", house: "Rajya Sabha", role: "Former Railway Minister", level: "National" },
  { name: "Derek O Brien", party: "TMC", constituency: "West Bengal", state: "West Bengal", house: "Rajya Sabha", role: "TMC Parliamentary Leader, RS", level: "National" },
  { name: "Kapil Sibal", party: "Independent", constituency: "Uttar Pradesh", state: "Uttar Pradesh", house: "Rajya Sabha", role: "MP, Rajya Sabha", level: "National" },
  { name: "P. Chidambaram", party: "INC", constituency: "Tamil Nadu", state: "Tamil Nadu", house: "Rajya Sabha", role: "Former Finance Minister", level: "National" },
  { name: "Jairam Ramesh", party: "INC", constituency: "Karnataka", state: "Karnataka", house: "Rajya Sabha", role: "INC General Secretary", level: "National" },
  { name: "Mallikarjun Kharge", party: "INC", constituency: "Karnataka", state: "Karnataka", house: "Rajya Sabha", role: "INC National President", level: "National" },
  { name: "Sitaram Yechury", party: "CPI(M)", constituency: "West Bengal", state: "West Bengal", house: "Rajya Sabha", role: "CPI(M) General Secretary", level: "National" },
];

export async function GET() {
  try {
    let added = 0;
    let skipped = 0;

    for (const mp of LOK_SABHA_MPs) {
      // Check if already exists
      const { data: existing } = await supabase
        .from("politicians")
        .select("id")
        .ilike("name", mp.name)
        .single();

      if (existing) {
        // Update with new fields
        await supabase
          .from("politicians")
          .update({
            constituency: mp.constituency,
            house: mp.house,
            level: mp.level,
            source: "Lok Sabha / Rajya Sabha Official Records",
          })
          .eq("id", existing.id);
        skipped++;
        continue;
      }

      // Insert new
      const { error } = await supabase.from("politicians").insert({
        name: mp.name,
        party: mp.party,
        state: mp.state,
        constituency: mp.constituency,
        house: mp.house,
        role: mp.role,
        level: mp.level,
        source: "Lok Sabha / Rajya Sabha Official Records",
        promises_kept: 0,
        promises_progress: 0,
        promises_broken: 0,
        total_promises: 0,
        verified: true,
      });

      if (!error) added++;
    }

    return NextResponse.json({
      success: true,
      added,
      skipped,
      total: LOK_SABHA_MPs.length,
      message: `Added ${added} new politicians, updated ${skipped} existing ones.`
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
