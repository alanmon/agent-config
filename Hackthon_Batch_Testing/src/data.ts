/**
 * Data for the prototype. Screen 1 is the Ads Manager dashboard, screen 3 is the
 * Lead agent hub test console; shapes mirror what each panel renders so this stays
 * the single source of truth.
 */

/* ============================================================
   Screen 1 — Ads Manager dashboard
   ============================================================ */

export interface Recommendation {
  id: string;
  /** 'score' renders the optimization-score progress variant. */
  kind: 'score' | 'standard';
  title: string;
  description: string;
  cta: string;
  /** Only for kind === 'score'. */
  percent?: number;
  /** Only for kind === 'standard'. */
  art?: 'plane' | 'clock';
}

export interface AdGroupStatus {
  id: string;
  count: number;
  label: string;
  variant: 'success' | 'warning' | 'error';
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  deltaLabel: string;
  deltaDirection: 'up' | 'down';
  defaultSelected: boolean;
  /** Line colour used when the metric is plotted. */
  color: string;
  /** Normalised 0–1 series, one point per x-axis tick. */
  series: number[];
}

export const recommendations: Recommendation[] = [
  {
    id: 'score',
    kind: 'score',
    percent: 60,
    title: 'Optimization score',
    description:
      'Get scored recommendations tailored to your campaign performance and optimization opportunities.',
    cta: 'View insights',
  },
  {
    id: 'rec-1',
    kind: 'standard',
    art: 'plane',
    title: 'Recommendation title',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
    cta: 'Action',
  },
  {
    id: 'rec-2',
    kind: 'standard',
    art: 'clock',
    title: 'Recommendation title',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
    cta: 'Action',
  },
];

export const accountOverview = {
  availableBalance: '15,546.86',
  todaySpend: '18,000.00',
  currency: 'USD',
};

export const adGroupStatuses: AdGroupStatus[] = [
  { id: 'active', count: 23, label: 'Active', variant: 'success' },
  { id: 'disapproved', count: 18, label: 'Disapproved', variant: 'error' },
  { id: 'out-of-budget', count: 2, label: 'Out of budget', variant: 'warning' },
];

export const dateRangeLabel = 'May 11, 2024 – May 17, 2024';
export const timezoneLabel = '(UTC-05:00) Eastern Standard Time';

export const chartTicks = ['Sep 6', 'Sep 7', 'Sep 8', 'Sep 9', 'Sep 10', 'Sep 11', 'Sep 12', 'Sep 13, 2023'];

export const metrics: Metric[] = [
  {
    id: 'impressions',
    label: 'Impressions',
    value: '502,345',
    deltaLabel: '10.1%',
    deltaDirection: 'up',
    defaultSelected: true,
    color: '#8B7FE8',
    series: [0.16, 0.62, 0.88, 0.52, 0.72, 0.34, 0.78, 0.1],
  },
  {
    id: 'cost',
    label: 'Cost',
    value: '28,360.15',
    unit: 'USD',
    deltaLabel: '5.1%',
    deltaDirection: 'down',
    defaultSelected: true,
    color: '#1B6B6B',
    series: [0.1, 0.44, 0.56, 0.34, 0.46, 0.2, 0.5, 0.06],
  },
  {
    id: 'click',
    label: 'Click',
    value: '62,217',
    deltaLabel: '10.1%',
    deltaDirection: 'up',
    defaultSelected: false,
    color: '#E8877F',
    series: [0.3, 0.24, 0.46, 0.7, 0.38, 0.62, 0.3, 0.44],
  },
  {
    id: 'conversions',
    label: 'Conversions',
    value: '3,523',
    deltaLabel: '10.1%',
    deltaDirection: 'up',
    defaultSelected: false,
    color: '#F0B429',
    series: [0.5, 0.36, 0.28, 0.58, 0.24, 0.48, 0.66, 0.32],
  },
];

/* ============================================================
   Screen 3 — Lead agent hub test console
   ============================================================ */

export type Rating = 'good' | 'acceptable' | 'poor';

/** A cited knowledge item shown under "This answer uses". */
export interface AnswerSource {
  kind: 'content' | 'guidance';
  title: string;
  meta: string;
}

export interface TestQuestion {
  id: string;
  /** The patient / user question sent to the agent. */
  question: string;
  /** Whether the agent produced an answer (drives the status check icon). */
  answered: boolean;
  /** Human rating of the answer quality. */
  rating: Rating;
  /** Agent response. Supports **bold** and emoji. */
  answer: string;
  /** Items grouped under "Content (n)". */
  content: AnswerSource[];
  /** Items grouped under "Guidance (n)". */
  guidance: AnswerSource[];
}

export interface TestGroup {
  /** Title shown in the console header. */
  title: string;
  updatedLabel: string;
  updatedBy: string;
  questions: TestQuestion[];
}

export const testGroup: TestGroup = {
  title: 'Created via manual entry',
  updatedLabel: 'Updated a few seconds ago by',
  updatedBy: 'Alex Smith',
  questions: [
    {
      id: 'q1',
      question: 'Does SLMobbin have a community?',
      answered: true,
      rating: 'good',
      answer:
        "While we don't have a traditional community forum, SLMobbin is built around collaboration! 🎨 Our platform features **Live Collaboration** for real-time editing and idea sharing, plus **Project Collaboration** where you can invite teammates, share files, and leave comments all in one creative space.\n\nThink of it as your creative sandbox where teams naturally connect through shared projects and brainstorming sessions. We're all about bringing designers and developers together to break out of the ordinary!",
      content: [
        { kind: 'content', title: 'Collaboration overview', meta: 'Help center · Article' },
        { kind: 'content', title: 'Sharing & permissions', meta: 'Help center · Article' },
      ],
      guidance: [
        { kind: 'guidance', title: 'Brand voice — friendly & creative', meta: 'Guidance' },
        { kind: 'guidance', title: 'Avoid over-promising features', meta: 'Guidance' },
        { kind: 'guidance', title: 'Encourage collaboration framing', meta: 'Guidance' },
      ],
    },
    {
      id: 'q2',
      question: 'What if I run into an issue?',
      answered: true,
      rating: 'acceptable',
      answer:
        "No worries — help is close by! You can reach our support team from the **Help** menu inside SLMobbin, or drop a message in the chat and we'll get back to you.\n\nMost common questions are also covered in our Help Center articles.",
      content: [{ kind: 'content', title: 'Contacting support', meta: 'Help center · Article' }],
      guidance: [
        { kind: 'guidance', title: 'Point users to Help Center first', meta: 'Guidance' },
        { kind: 'guidance', title: 'Keep replies reassuring', meta: 'Guidance' },
      ],
    },
    {
      id: 'q3',
      question: 'Is SLMobbin free?',
      answered: true,
      rating: 'poor',
      answer:
        'SLMobbin offers a range of plans. Pricing depends on your team size and the features you need — I can point you to the pricing page for the latest details.',
      content: [],
      guidance: [{ kind: 'guidance', title: 'Do not quote exact prices', meta: 'Guidance' }],
    },
    {
      id: 'q4',
      question: 'What makes SLMobbin different from other design tools?',
      answered: true,
      rating: 'good',
      answer:
        "Great question! SLMobbin blends **design and collaboration** in one place — real-time editing, shared project spaces, and developer-friendly handoff. Instead of juggling separate tools, your whole team works in a single creative sandbox.",
      content: [
        { kind: 'content', title: 'Why SLMobbin', meta: 'Help center · Article' },
        { kind: 'content', title: 'Feature comparison', meta: 'Help center · Article' },
      ],
      guidance: [{ kind: 'guidance', title: 'Highlight collaboration differentiator', meta: 'Guidance' }],
    },
    {
      id: 'q5',
      question: 'Hi, I just signed up for SLMobbin — where do I start?',
      answered: true,
      rating: 'good',
      answer:
        "Welcome aboard! 👋 The best place to start is your **Home** dashboard, where you can create your first project or open a starter template. From there, invite a teammate and try Live Collaboration to see the magic.",
      content: [{ kind: 'content', title: 'Getting started guide', meta: 'Help center · Article' }],
      guidance: [
        { kind: 'guidance', title: 'Warmly welcome new users', meta: 'Guidance' },
        { kind: 'guidance', title: 'Suggest a concrete first action', meta: 'Guidance' },
      ],
    },
  ],
};
