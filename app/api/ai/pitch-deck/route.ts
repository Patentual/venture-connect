import OpenAI from 'openai';
import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';

const SYSTEM_PROMPT = `You are a pitch deck strategist for early-stage startups. Given project details, generate a structured pitch deck outline as JSON.

Return a JSON object with this shape:
{
  "slides": [
    {
      "title": "Slide title",
      "type": "cover|problem|solution|market|business_model|traction|team|roadmap|financials|ask",
      "bullets": ["Key point 1", "Key point 2", "Key point 3"],
      "speakerNotes": "Detailed notes for presenting this slide"
    }
  ]
}

Generate 10-12 slides covering: Cover, Problem, Solution, Market Opportunity, Business Model, Traction/Milestones, Team, Product Roadmap, Financial Projections, and The Ask. Make it compelling and investor-ready. Be specific using the project details provided.`;

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.twoFactorVerified) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return Response.json(
        { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const { projectId } = await request.json();
    if (!projectId) {
      return Response.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Fetch project data and verify membership
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    const project = projectDoc.data()!;
    const memberIds: string[] = project.teamMemberIds || [];
    if (!memberIds.includes(session.userId) && project.creatorId !== session.userId) {
      return Response.json({ error: 'Not a project member' }, { status: 403 });
    }

    // Fetch creator profile
    let creatorName = 'Founder';
    if (project.creatorId) {
      const profileDoc = await adminDb.collection('profiles').doc(project.creatorId).get();
      if (profileDoc.exists) {
        creatorName = profileDoc.data()?.fullName || 'Founder';
      }
    }

    const phases = project.timeline?.phases || [];
    const milestones = phases.flatMap((p: { milestones?: { title: string; status: string }[] }) => p.milestones || []);
    const completedMilestones = milestones.filter((m: { status: string }) => m.status === 'completed');

    const projectContext = `
Project: ${project.title || 'Untitled'}
Description: ${project.description || 'N/A'}
Industry: ${project.industry || 'Technology'}
Required Skills: ${(project.requiredSkills || []).join(', ')}
Team Size: ${(project.teamMemberIds || []).length} members
Founder: ${creatorName}
Phases: ${phases.map((p: { name: string }) => p.name).join(' → ')}
Completed Milestones: ${completedMilestones.map((m: { title: string }) => m.title).join(', ') || 'None yet'}
Total Milestones: ${milestones.length}
Status: ${project.status || 'planning'}
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a pitch deck for this project:\n${projectContext}` },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return Response.json({ error: 'No response from AI' }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code fences
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        parsed = { slides: [{ title: 'Generated Content', type: 'cover', bullets: [text], speakerNotes: '' }] };
      }
    }

    // Ensure mandatory VentureNex closing slide is always present
    const vnClosingSlide = {
      title: 'Built with VentureNex',
      type: 'venturenex',
      bullets: [
        'AI-powered project planning & team building',
        'Investor-ready pitch decks generated in seconds',
        'Secure data rooms with NDA-protected access',
        'Learn more at venturenex.com',
      ],
      speakerNotes: 'This project was planned, assembled, and pitched using the VentureNex platform — the AI-powered business directory for launching ventures globally.',
    };
    // Remove any existing VN slide (in case of re-generation) and append fresh one
    parsed.slides = (parsed.slides || []).filter((s: { type: string }) => s.type !== 'venturenex');
    parsed.slides.push(vnClosingSlide);

    // Save to Firestore for later retrieval
    await adminDb.collection('projects').doc(projectId).update({
      pitchDeck: parsed,
      pitchDeckGeneratedAt: new Date().toISOString(),
    });

    return Response.json(parsed);
  } catch (error: unknown) {
    console.error('Pitch deck generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('rate_limit') || message.includes('429')) {
      return Response.json({ error: 'Rate limited. Please try again in a moment.' }, { status: 429 });
    }
    return Response.json({ error: 'Failed to generate pitch deck.' }, { status: 500 });
  }
}
