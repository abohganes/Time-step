// Supabase Edge Function: AI assistant for tasks/habits.
// The Gemini API key lives only here (as a Supabase secret) — the mobile
// app never sees it, it only calls this function with its own Supabase session.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_TOOL_ROUNDS = 5;
const HISTORY_LIMIT = 20;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ChatRow = { role: 'user' | 'assistant'; content: string };
type Task = { id: string; title: string; due_date: string | null };
type Habit = { id: string; title: string; reminder_time: string | null };
type HabitLog = { habit_id: string; completed_date: string };

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'create_task',
        description: 'Create a new to-do task for the user.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short task title' },
            description: { type: 'string', description: 'Optional longer description' },
            due_date: {
              type: 'string',
              description: 'Optional ISO 8601 due date/time, e.g. 2026-07-26T18:00:00Z',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'create_habit',
        description: 'Create a new daily habit for the user to track.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short habit title' },
            description: { type: 'string', description: 'Optional longer description' },
            reminder_time: {
              type: 'string',
              description: 'Optional daily reminder time in 24h HH:MM format, e.g. 08:30',
            },
          },
          required: ['title'],
        },
      },
    ],
  },
];

function computeStreak(logs: HabitLog[], habitId: string): number {
  const dates = new Set(logs.filter((l) => l.habit_id === habitId).map((l) => l.completed_date));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  let cursor = new Date();
  if (!dates.has(fmt(cursor))) cursor = new Date(cursor.getTime() - 86400000);
  let streak = 0;
  while (dates.has(fmt(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

async function buildSystemPrompt(supabase: ReturnType<typeof createClient>) {
  const [{ data: tasks }, { data: habits }, { data: logs }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, due_date')
      .eq('is_completed', false)
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('habits').select('id, title, reminder_time').eq('is_active', true),
    supabase
      .from('habit_logs')
      .select('habit_id, completed_date')
      .order('completed_date', { ascending: false })
      .limit(300),
  ]);

  const taskLines = ((tasks ?? []) as Task[])
    .map((t) => `- "${t.title}"${t.due_date ? ` (due ${t.due_date})` : ' (no due date)'}`)
    .join('\n') || '(none)';

  const habitLines = ((habits ?? []) as Habit[])
    .map((h) => `- "${h.title}", current streak: ${computeStreak((logs ?? []) as HabitLog[], h.id)} day(s)`)
    .join('\n') || '(none)';

  return `You are a friendly, concise productivity assistant inside a personal tasks/habits/notes app.
Today's date is ${new Date().toISOString().slice(0, 10)}.

The user's open tasks:
${taskLines}

The user's active habits:
${habitLines}

You can help plan their schedule, prioritize tasks, break a large task into smaller ones, suggest how to use free time today, motivate them, and analyze their habits/streaks.
When the user agrees to add tasks or habits (e.g. after you break down a big task into steps), call the create_task / create_habit tools instead of just describing them in text.
Keep replies short and actionable. Reply in the same language the user writes in.`;
}

function toGeminiRole(role: 'user' | 'assistant') {
  return role === 'assistant' ? 'model' : 'user';
}

async function executeTool(
  supabase: ReturnType<typeof createClient>,
  name: string,
  args: Record<string, unknown>
) {
  if (name === 'create_task') {
    const { error } = await supabase.from('tasks').insert({
      title: String(args.title ?? '').slice(0, 200),
      description: args.description ? String(args.description) : null,
      due_date: args.due_date ? String(args.due_date) : null,
    });
    return error ? { error: error.message } : { success: true };
  }
  if (name === 'create_habit') {
    const reminder = args.reminder_time ? `${String(args.reminder_time)}:00`.slice(0, 8) : null;
    const { error } = await supabase.from('habits').insert({
      title: String(args.title ?? '').slice(0, 200),
      description: args.description ? String(args.description) : null,
      reminder_time: reminder,
    });
    return error ? { error: error.message } : { success: true };
  }
  return { error: `Unknown tool ${name}` };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { message } = await req.json();
    if (!message || typeof message !== 'string') return json({ error: 'Missing message' }, 400);

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) return json({ error: 'Assistant is not configured' }, 500);

    await supabase.from('chat_messages').insert({ role: 'user', content: message });

    const { data: historyRows } = await supabase
      .from('chat_messages')
      .select('role, content')
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT);
    const history = ((historyRows ?? []) as ChatRow[]).reverse();

    const systemPrompt = await buildSystemPrompt(supabase);

    type GeminiPart = { text?: string } | { functionCall?: { name: string; args: Record<string, unknown> } } | { functionResponse?: { name: string; response: unknown } };
    type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

    const contents: GeminiContent[] = history.map((row) => ({
      role: toGeminiRole(row.role),
      parts: [{ text: row.content }],
    }));

    let finalText = '';
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const res = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          tools: TOOLS,
          systemInstruction: { parts: [{ text: systemPrompt }] },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return json({ error: `Gemini API error: ${errText}` }, 502);
      }

      const data = await res.json();
      const candidateParts = data.candidates?.[0]?.content?.parts ?? [];
      const functionCalls = candidateParts.filter((p: Record<string, unknown>) => p.functionCall);

      if (functionCalls.length === 0) {
        finalText = candidateParts.map((p: { text?: string }) => p.text ?? '').join('');
        break;
      }

      contents.push({ role: 'model', parts: candidateParts });

      const responseParts: GeminiPart[] = [];
      for (const part of functionCalls) {
        const call = part.functionCall as { name: string; args: Record<string, unknown> };
        const result = await executeTool(supabase, call.name, call.args ?? {});
        responseParts.push({ functionResponse: { name: call.name, response: result } });
      }
      contents.push({ role: 'user', parts: responseParts });
    }

    if (!finalText) finalText = "Sorry, I couldn't finish that — try rephrasing?";

    await supabase.from('chat_messages').insert({ role: 'assistant', content: finalText });

    return json({ reply: finalText });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
