import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const {
      semester,
      targetRole,
      hoursPerWeek,
      focusAreas,
      upcomingExams,
      extraContext,
    } = body ?? {};

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
- If hours are very low (\<= 5), give a tiny but still helpful plan instead of overloading them.
- Do not exceed the approximate total hours they mentioned by more than 20%.
- Prefer evening / early-morning slots on weekdays and flexible slots on weekends.

Output format (use clear headings and bullet points):
1) "Overview" – 3-6 lines summarising the main strategy.
2) "Weekly timetable" – for each day Mon–Sun, give 2-4 bullet points with concrete time ranges (e.g. 7–9 pm) and specific tasks (topics, practice type).
3) "Non‑negotiable habits" – 3–6 short bullets about daily/weekly habits.
4) "Next 4 weeks milestones" – 4–8 bullets with measurable, realistic goals.

Tone:
- Encouraging but honest about trade-offs.
- Very specific and actionable (mention topics, problem types, and task categories; not brand-name courses).
- Avoid generic motivational quotes and avoid repeating the same advice in many lines.

Always base your plan on the student profile given below.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create a personalised weekly study & placement plan.\n\n${userProfileSummary}`,
          },
        ],
        // Use a smaller completion budget so the model doesn't spend
        // everything on internal reasoning tokens and return empty content.
        max_completion_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error for study-planner:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate study plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    let plan = data.choices?.[0]?.message?.content;

    if (!plan || !plan.trim()) {
      console.error("No plan content returned from OpenAI", data);
      // Fall back to a simple text so the UI still shows something
      plan =
        "Here is a simple starting point: aim for at least 3 focused study blocks per week (DSA, core subjects, and projects), " +
        "plus 1 placement-focused block for resume, mock interviews, or previous year questions. Adjust the load based on your semester.";
    }

    plan = plan.trim();

    return new Response(JSON.stringify({ plan }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in study-planner function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
