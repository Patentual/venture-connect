import { aiClient, CHAT_MODEL, isAIConfigured } from '@/lib/ai/client';
import { PROJECT_PLANNER_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { getSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.twoFactorVerified) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return Response.json(
        { error: 'AI service not configured. Set Azure OpenAI or OpenAI credentials.' },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const completion = await aiClient.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: PROJECT_PLANNER_SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return Response.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // If AI didn't return valid JSON, wrap it as a message
      parsed = { type: 'message', content: responseText };
    }

    return Response.json(parsed);
  } catch (error: unknown) {
    console.error('AI Plan API error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('rate_limit') || message.includes('429')) {
      return Response.json(
        { error: 'Rate limited. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return Response.json(
      { error: 'Failed to generate project plan. Please try again.' },
      { status: 500 }
    );
  }
}
