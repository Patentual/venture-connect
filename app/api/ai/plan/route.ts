import OpenAI from 'openai';
import { PROJECT_PLANNER_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return Response.json(
        { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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
