import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

function makeUserPrompt(body: Record<string, unknown>) {
  const userProfileSummary = `
Student profile:
- Semester / year: ${body.semester || "not specified"}
- Target role or goal: ${body.targetRole || "not specified"}
- Available hours per week: ${body.hoursPerWeek || "not specified"}
- Focus areas: ${Array.isArray(body.focusAreas) ? body.focusAreas.join(", ") : body.focusAreas || "not specified"}
- Upcoming exams or deadlines: ${body.upcomingExams || "not specified"}
- Extra constraints or notes: ${body.extraContext || "none"}
`.trim();

  return `Create a personalised weekly study & placement plan.\n\n${userProfileSummary}`;
}

async function callAnthropic(prompt: string) {
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY missing");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`anthropic_${response.status}:${errorText}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text?.trim();
  if (!text) throw new Error("anthropic_empty_response");
  return text;
}

async function callOpenAI(prompt: string) {
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIApiKey) throw new Error("OPENAI_API_KEY missing");

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
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`openai_${response.status}:${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("openai_empty_response");
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired authentication token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const prompt = makeUserPrompt(body ?? {});

    let plan = "";
    let anthropicError: string | null = null;

    try {
      plan = await callAnthropic(prompt);
    } catch (error) {
      anthropicError = error instanceof Error ? error.message : "anthropic_unknown_error";
      console.error("Anthropic failed, trying fallback:", anthropicError);
      plan = await callOpenAI(prompt);
    }

    return new Response(JSON.stringify({ plan, providerWarning: anthropicError }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("study-planner error:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to generate study plan", details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
