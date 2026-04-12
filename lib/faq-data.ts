export interface FaqItem { q: string; a: string }
export interface FaqSection { title: string; items: FaqItem[] }

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'About the Platform',
    items: [
      { q: 'What is VentureNex?', a: 'An AI-powered collaboration platform that helps take projects from inception to investment-readiness, with AI planning, talent discovery, team assembly, NDA management, and pitch deck generation.' },
      { q: 'Who is it for?', a: 'Entrepreneurs, project leaders, professionals seeking collaboration, startups preparing for investment, and recruiters (Talent Sourcing subscription required).' },
      { q: 'How does the AI Planner work?', a: 'Describe your idea conversationally. The AI generates phases, milestones, timelines, budgets, and personnel needs. Refine through follow-up before approving.' },
      { q: 'Can I use it for free?', a: 'Yes. The Free tier includes project creation, AI Planner, and team collaboration. Premium features require a paid subscription.' },
    ],
  },
  {
    title: 'Projects & Collaboration',
    items: [
      { q: 'How do I start a project?', a: 'Use the AI Planner or create manually from your Dashboard. Both provide a full workspace with milestones, team management, files, and discussions.' },
      { q: 'How do I invite team members?', a: 'Search the Directory by skills/location, or use AI outreach which auto-identifies matching professionals and sends confidential invitations.' },
      { q: 'What happens when someone is invited?', a: 'They receive a notification and email. Before joining they must sign an NDA and acknowledge the liability disclaimer regarding external payment arrangements.' },
      { q: 'Can I generate a pitch deck?', a: 'Yes. AI generates investor-ready decks from your project data with customisable branding and AI-generated images.' },
    ],
  },
  {
    title: 'Intellectual Property & Records',
    items: [
      { q: 'Does VentureNex protect my IP?', a: 'NDA management is built in. The platform retains timestamped records of activity and contributions, useful for proof-of-inventorship documentation.' },
      { q: 'Can data be deleted by the project leader?', a: 'No. Project data is not selectively deletable by any user to preserve record integrity for all participants, particularly for IP and inventorship purposes.' },
      { q: 'Are completion records retained?', a: 'Yes. Milestone completion timestamps are permanently recorded as part of project history.' },
      { q: 'Does VentureNex certify work performed?', a: 'No. The platform records activity but does not verify, certify, or warrant work quality. It is not a notary, escrow, arbitrator, or legal authority.' },
    ],
  },
  {
    title: 'Legal, Payments & Liability',
    items: [
      { q: 'Does VentureNex handle payments?', a: 'No. All compensation — rates, schedules, methods, tax, benefits — must be arranged directly between the project leader and team members, outside VentureNex.' },
      { q: 'Where should compensation be documented?', a: 'In writing, outside the platform, using your own contracts. VentureNex provides guidance but does not store or enforce compensation records.' },
      { q: 'Is VentureNex liable for user disputes?', a: 'No. VentureNex is not a party to any agreement between users and bears no liability for disputes, non-payment, or claims. See Terms of Service Sections 8, 9, and 14.' },
      { q: "What is VentureNex's role?", a: 'Exclusively a collaboration facilitator. Not an employer, staffing agency, contractor, payment processor, or joint venture partner.' },
      { q: 'Do I need my own contract with team members?', a: 'Strongly recommended. All employment, contractor, and engagement terms should be formalised independently. VentureNex has no role in these arrangements.' },
      { q: 'Who is responsible for tax and legal compliance?', a: 'Each user is responsible for their own tax, employment, labour, and contractor law compliance in their jurisdiction.' },
    ],
  },
];
