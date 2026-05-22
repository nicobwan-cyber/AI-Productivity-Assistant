export type Template = {
  id: string;
  title: string;
  category: string;
  description: string;
  body: string;
  tool: "/email" | "/meetings" | "/tasks" | "/research" | "/chat" | "/improve";
  prefillKey: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "email-followup",
    title: "Follow-up after a meeting",
    category: "Emails",
    description: "Polite follow-up summarizing what was discussed and next steps.",
    tool: "/email",
    prefillKey: "purpose",
    body: "Follow up after a client meeting, recap the 3 key discussion points, confirm next steps, and propose a check-in next week.",
  },
  {
    id: "email-intro",
    title: "Cold introduction email",
    category: "Emails",
    description: "Warm, concise intro to a new contact.",
    tool: "/email",
    prefillKey: "purpose",
    body: "Introduce myself to a prospective client, briefly explain how we help similar companies, and request a 15-minute intro call.",
  },
  {
    id: "email-decline",
    title: "Politely decline a request",
    category: "Emails",
    description: "Decline while keeping the relationship warm.",
    tool: "/email",
    prefillKey: "purpose",
    body: "Politely decline a meeting request due to capacity, suggest an async update instead, and offer to reconnect next month.",
  },
  {
    id: "meeting-standup",
    title: "Daily standup summary",
    category: "Meetings",
    description: "Crisp summary with owners and blockers.",
    tool: "/meetings",
    prefillKey: "notes",
    body: "Standup notes:\n- Alex: shipped login refactor, working on SSO\n- Priya: blocked on API contract from platform team\n- Sam: QA on checkout, needs design review by EOD",
  },
  {
    id: "meeting-1on1",
    title: "1:1 recap",
    category: "Meetings",
    description: "Summarize a manager / report 1:1.",
    tool: "/meetings",
    prefillKey: "notes",
    body: "1:1 notes: discussed Q3 goals, growth areas, current blockers on the data project, and career conversation about moving toward a tech lead role.",
  },
  {
    id: "report-weekly",
    title: "Weekly status report",
    category: "Reports",
    description: "Wins, in-flight, blockers, next week.",
    tool: "/improve",
    prefillKey: "text",
    body: "This week we shipped onboarding v2, started the billing migration, and are still blocked on legal review for the new ToS. Next week we focus on closing the migration and starting analytics.",
  },
  {
    id: "report-project",
    title: "Project update",
    category: "Reports",
    description: "Stakeholder-friendly progress update.",
    tool: "/improve",
    prefillKey: "text",
    body: "Project Atlas is on track. Phase 1 complete, Phase 2 design review next Tuesday. Risks: vendor delay on the data import tool. Asking for a decision on scope cut by Friday.",
  },
  {
    id: "research-brief",
    title: "Market research brief",
    category: "Research",
    description: "Background, competitors, risks, recommendation.",
    tool: "/research",
    prefillKey: "topic",
    body: "AI productivity tools landscape for mid-market SaaS teams in 2026",
  },
  {
    id: "task-week",
    title: "Plan my week",
    category: "Tasks",
    description: "Turn a brain-dump into a planned week.",
    tool: "/tasks",
    prefillKey: "tasks",
    body: "Finish board deck (Tue), review hiring loop, draft Q4 OKRs, customer interviews x3, fix top 5 bugs, prep all-hands talk.",
  },
  {
    id: "msg-thanks",
    title: "Professional thank-you",
    category: "Messages",
    description: "Sincere, short thank-you message.",
    tool: "/improve",
    prefillKey: "text",
    body: "thanks for jumping in on the launch last night, really appreciate it — couldn't have hit the date without your help.",
  },
  {
    id: "msg-feedback",
    title: "Constructive feedback",
    category: "Messages",
    description: "Direct but kind feedback.",
    tool: "/improve",
    prefillKey: "text",
    body: "Want to share some feedback on the presentation — the data was strong but the story felt a bit hard to follow. Maybe lead with the recommendation next time?",
  },
  {
    id: "msg-announce",
    title: "Team announcement",
    category: "Messages",
    description: "Friendly, clear company update.",
    tool: "/improve",
    prefillKey: "text",
    body: "Quick announcement: we are rolling out a new PTO policy starting next month. Same total days, more flexibility. Details in the doc, AMA Friday.",
  },
];
