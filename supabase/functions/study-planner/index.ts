import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { semester, targetRole, hoursPerWeek, focusAreas, upcomingExams, extraContext } = body ?? {};

    const userProfileSummary = `
Student profile:
- Semester / year: ${semester || "not specified"}
- Target role or goal: ${targetRole || "not specified"}
- Available hours per week: ${hoursPerWeek || "not specified"}
- Focus areas: ${Array.isArray(focusAreas) ? focusAreas.join(", ") : focusAreas || "not specified"}
- Upcoming exams or deadlines: ${upcomingExams || "not specified"}
- Extra constraints or notes: ${extraContext || "none"}
`.trim();

    const systemPrompt = `You are a senior CSE mentor helping a student plan their weekly study and placement prep.

Constraints:
- The student is in an Indian engineering college context (CSE/IT).
- They usually have labs, internal tests, and project work.
- Your plan must be realistic for the given "hours per week" in the profile.
- If hours are very low (<= 5), give a tiny but still helpful plan instead of overloading them.
- Do not exceed the approximate total hours they mentioned by more than 20%.
- Prefer evening / early-morning slots on weekdays and flexible slots on weekends.

Output format (use clear headings and bullet points):
1) "Overview" – 3-6 lines summarising the main strategy.
2) "Weekly timetable" – for each day Mon–Sun, give 2-4 bullet points with concrete time ranges (e.g. 7–9 pm) and specific tasks.
3) "Non‑negotiable habits" – 3–6 short bullets about daily/weekly habits.
4) "Next 4 weeks milestones" – 4–8 bullets with measurable, realistic goals.

Tone: Encouraging but honest. Very specific and actionable.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a personalised weekly study & placement plan.\n\n${userProfileSummary}` },
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate study plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    let plan = data.choices?.[0]?.message?.content;

    if (!plan?.trim()) {
      plan = "Here is a simple starting point: aim for at least 3 focused study blocks per week (DSA, core subjects, and projects), plus 1 placement-focused block.";
    }

    return new Response(JSON.stringify({ plan: plan.trim() }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("study-planner error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
