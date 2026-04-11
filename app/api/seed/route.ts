import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  const auth = request.headers.get('x-api-secret');
  if (auth !== process.env.BLOG_GENERATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const creatorId = (body as { creatorId?: string }).creatorId;
    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const projectId = 'test-project-' + Date.now();

    // --- Seed team member profiles ---
    const members = [
      { id: 'member-alice', fullName: 'Alice Chen', email: 'alice@example.com', headline: 'Full Stack Developer', skills: ['React', 'Node.js', 'TypeScript', 'AWS'] },
      { id: 'member-bob', fullName: 'Bob Martinez', email: 'bob@example.com', headline: 'UI/UX Designer', skills: ['Figma', 'Design Systems', 'User Research', 'CSS'] },
      { id: 'member-carol', fullName: 'Carol Nguyen', email: 'carol@example.com', headline: 'Product Manager', skills: ['Agile', 'Roadmapping', 'Analytics', 'Strategy'] },
    ];

    for (const m of members) {
      await adminDb.collection('profiles').doc(m.id).set({
        fullName: m.fullName, email: m.email, headline: m.headline,
        skills: m.skills, createdAt: now,
      }, { merge: true });
    }

    const teamMemberIds = [creatorId, ...members.map(m => m.id)];

    // --- Seed project ---
    const project = {
      id: projectId,
      creatorId,
      title: 'AI-Powered Supply Chain Platform',
      synopsis: 'Building an AI platform that optimizes supply chain logistics for SMEs using real-time data and predictive analytics.',
      description: 'This project aims to develop a comprehensive AI-driven platform that helps small and medium enterprises optimize their supply chain operations. The platform will leverage machine learning for demand forecasting, route optimization, and inventory management. Key features include real-time tracking, automated reordering, and predictive analytics dashboards.',
      status: 'active',
      isPublic: false,
      timeline: {
        phases: [
          {
            id: 'phase-1', name: 'Discovery & Research', description: 'Market research and technical feasibility', order: 1,
            startDate: '2026-04-01', endDate: '2026-04-30',
            milestones: [
              { id: 'ms-1', phaseId: 'phase-1', title: 'Market analysis complete', description: 'Comprehensive analysis of competitor landscape', status: 'completed', dueDate: '2026-04-10', completedAt: '2026-04-09', assigneeIds: [creatorId] },
              { id: 'ms-2', phaseId: 'phase-1', title: 'Technical architecture approved', description: 'System design and tech stack finalized', status: 'completed', dueDate: '2026-04-20', completedAt: '2026-04-18', assigneeIds: ['member-alice'] },
              { id: 'ms-3', phaseId: 'phase-1', title: 'User interview findings', description: 'Synthesize findings from 15+ user interviews', status: 'completed', dueDate: '2026-04-28', completedAt: '2026-04-27', assigneeIds: ['member-carol'] },
            ],
            personnelNeeds: [], toolsAndMaterials: ['Notion', 'Miro', 'Google Docs'],
          },
          {
            id: 'phase-2', name: 'MVP Development', description: 'Build core features', order: 2,
            startDate: '2026-05-01', endDate: '2026-06-30',
            milestones: [
              { id: 'ms-4', phaseId: 'phase-2', title: 'API layer complete', description: 'REST API with auth, CRUD, and webhooks', status: 'in_progress', dueDate: '2026-05-15', assigneeIds: ['member-alice'] },
              { id: 'ms-5', phaseId: 'phase-2', title: 'Dashboard UI ready', description: 'Main analytics dashboard with charts', status: 'in_progress', dueDate: '2026-05-25', assigneeIds: ['member-bob'] },
              { id: 'ms-6', phaseId: 'phase-2', title: 'ML model v1 trained', description: 'Demand forecasting model with 85%+ accuracy', status: 'pending', dueDate: '2026-06-10', assigneeIds: [creatorId] },
              { id: 'ms-7', phaseId: 'phase-2', title: 'Beta release', description: 'Deploy to 5 pilot customers', status: 'pending', dueDate: '2026-06-30', assigneeIds: teamMemberIds },
            ],
            personnelNeeds: [], toolsAndMaterials: ['VS Code', 'GitHub', 'Vercel', 'Firebase'],
          },
          {
            id: 'phase-3', name: 'Launch & Growth', description: 'Public launch and scaling', order: 3,
            startDate: '2026-07-01', endDate: '2026-08-31',
            milestones: [
              { id: 'ms-8', phaseId: 'phase-3', title: 'Public launch', description: 'Production deployment with marketing campaign', status: 'pending', dueDate: '2026-07-15', assigneeIds: teamMemberIds },
              { id: 'ms-9', phaseId: 'phase-3', title: '100 paying customers', description: 'Hit first 100 subscriber milestone', status: 'pending', dueDate: '2026-08-31', assigneeIds: [creatorId, 'member-carol'] },
            ],
            personnelNeeds: [], toolsAndMaterials: ['Stripe', 'Intercom', 'Mixpanel'],
          },
        ],
        totalDuration: '5 months',
        generatedByAI: true,
      },
      teamMemberIds,
      pendingInviteIds: [],
      maxTeamSize: 8,
      isRemote: true,
      industry: 'Technology / Logistics',
      requiredSkills: ['React', 'Node.js', 'Machine Learning', 'UI/UX Design', 'Product Management'],
      estimatedDuration: '5 months',
      estimatedBudget: 45000,
      budgetCurrency: '$',
      startDate: '2026-04-01',
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection('projects').doc(projectId).set(project);

    // --- Seed discussion threads ---
    const threads = [
      { title: 'Tech stack decision: Next.js vs Remix?', content: 'I think we should go with Next.js for the dashboard given our team experience. Any thoughts on using Remix instead? The nested routing looks cleaner but the ecosystem is smaller.', authorId: 'member-alice' },
      { title: 'Q2 sprint planning priorities', content: 'We need to prioritize the API layer and dashboard UI for the next sprint. The ML model can run in parallel. Let me know what blockers you foresee.', authorId: 'member-carol' },
      { title: 'Design system color palette', content: 'I have put together a color palette based on the brand guidelines. Blues and greens for trust/growth. Sharing the Figma link in files. Please review by Friday.', authorId: 'member-bob' },
    ];

    for (let i = 0; i < threads.length; i++) {
      const threadId = `thread-${i + 1}`;
      await adminDb.collection('projects').doc(projectId).collection('threads').doc(threadId).set({
        title: threads[i].title,
        content: threads[i].content,
        authorId: threads[i].authorId,
        postedAt: new Date(Date.now() - (3 - i) * 86400000).toISOString(),
      });

      // Add a reply to first thread
      if (i === 0) {
        await adminDb.collection('projects').doc(projectId).collection('threads').doc(threadId).collection('replies').doc('reply-1').set({
          content: 'Agreed on Next.js. The App Router with server actions is great for our use case. Plus we already have the Vercel deployment pipeline set up.',
          authorId: creatorId,
          postedAt: new Date(Date.now() - 2.5 * 86400000).toISOString(),
        });
        await adminDb.collection('projects').doc(projectId).collection('threads').doc(threadId).collection('replies').doc('reply-2').set({
          content: 'Next.js +1. I can start on the component library this week if we lock it in.',
          authorId: 'member-bob',
          postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        });
      }
    }

    // --- Seed ratings ---
    await adminDb.collection('projects').doc(projectId).collection('ratings').doc(`${creatorId}_member-alice`).set({
      raterId: creatorId, ratedUserId: 'member-alice', rating: 5, updatedAt: now,
    });
    await adminDb.collection('projects').doc(projectId).collection('ratings').doc(`${creatorId}_member-bob`).set({
      raterId: creatorId, ratedUserId: 'member-bob', rating: 4, updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      projectId,
      message: `Seeded project "${project.title}" with ${teamMemberIds.length} members, ${threads.length} threads, milestones across 3 phases, and 2 ratings.`,
      url: `/dashboard/projects/${projectId}`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
