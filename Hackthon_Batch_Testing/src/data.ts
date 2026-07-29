/**
 * Data for the "Test" screen. Shapes mirror what the console + evaluate panel
 * render, so this is the single source of truth the two panels share.
 */

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
