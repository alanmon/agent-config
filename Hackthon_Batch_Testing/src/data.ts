/**
 * Data for the "Test" screen. Shapes mirror what the console + evaluate panel
 * render, so this is the single source of truth the two panels share.
 *
 * Domain: Med-Spa Consultation Agent (see ../CLAUDE.md). `questionBank` is the
 * full generated candidate pool (5 per category); `testGroup.questions`
 * starts empty so the app boots into the empty-state journey.
 */

/** Manual human rating, set from the Evaluate panel. Independent of `status`. */
export type Rating = 'good' | 'acceptable' | 'poor';

/** Automated evaluation outcome, revealed by "Run evaluation". */
export type EvalStatus = 'pass' | 'knowledge_gap' | 'failure';

export const CATEGORIES = [
  'Price',
  'Results',
  'Health condition',
  'Treatment types',
  'Clinic staff',
  'Licensing & legal',
  'Refund policy',
  'First consultation',
  'New customers',
  'General',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** A cited knowledge item shown under "This answer uses". */
export interface AnswerSource {
  kind: 'content' | 'guidance';
  title: string;
  meta: string;
}

/** Why a question failed or hit a knowledge gap, shown in the Evaluate panel. */
export interface RootCause {
  label: string;
  detail: string;
}

export interface TestQuestion {
  id: string;
  category: Category;
  /** The patient / user question sent to the agent. */
  question: string;
  /** Evaluation outcome. `null` until "Run evaluation" has been clicked. */
  status: EvalStatus | null;
  /** Manual human rating, set from the Evaluate panel. `null` until set. */
  rating: Rating | null;
  /** Agent response. Supports **bold** and emoji. Empty until evaluated. */
  answer: string;
  /** Items grouped under "Content (n)". */
  content: AnswerSource[];
  /** Items grouped under "Guidance (n)". */
  guidance: AnswerSource[];
  /** Present for `knowledge_gap` / `failure` outcomes. */
  rootCause?: RootCause;
}

export interface TestGroup {
  /** Title shown in the console header. */
  title: string;
  updatedLabel: string;
  updatedBy: string;
  questions: TestQuestion[];
}

/** Full candidate pool offered by "Generate questions". Not yet evaluated. */
export const questionBank: TestQuestion[] = [
  // ---------- Price ----------
  {
    id: 'p1',
    category: 'Price',
    question: 'What is the typical starting price for a Botox treatment at your clinic?',
    status: 'pass',
    rating: null,
    answer:
      "Botox starts at **$12 per unit**, with most first-time areas (forehead, frown lines, or crow's feet) using 20–30 units. Your injector will confirm an exact unit count and price during your consultation before treatment.",
    content: [{ kind: 'content', title: 'Botox pricing guide', meta: 'Help center · Article' }],
    guidance: [{ kind: 'guidance', title: 'Always quote per-unit pricing, not flat rates', meta: 'Guidance' }],
  },
  {
    id: 'p2',
    category: 'Price',
    question: 'Do you charge Botox by unit or by treatment area?',
    status: 'pass',
    rating: null,
    answer:
      'We charge **per unit** rather than per area, since the number of units needed varies by patient. This keeps pricing precise to your anatomy instead of a flat per-zone fee.',
    content: [{ kind: 'content', title: 'Botox pricing guide', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'p3',
    category: 'Price',
    question: 'Are there package prices if I combine multiple treatments in one visit?',
    status: 'pass',
    rating: null,
    answer:
      "Yes — combining Botox with filler or a laser add-on qualifies for our **Multi-Treatment Bundle**, a 10% discount applied automatically at checkout when two or more services are booked same-day.",
    content: [{ kind: 'content', title: 'Bundled treatment pricing', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'p4',
    category: 'Price',
    question: 'Is there a deposit required to reserve an appointment?',
    status: 'pass',
    rating: null,
    answer:
      'A **$50 deposit** is required to hold any injectable or laser appointment. It’s applied toward your treatment total and is refundable with 24 hours’ notice.',
    content: [{ kind: 'content', title: 'Booking & deposit policy', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'p5',
    category: 'Price',
    question: 'Can you provide a full quote before I decide to proceed?',
    status: 'pass',
    rating: null,
    answer:
      "Absolutely — during your consultation, your provider will map out the recommended units or sessions and give you a **written quote** with no obligation to book that day.",
    content: [{ kind: 'content', title: 'Consultation process', meta: 'Help center · Article' }],
    guidance: [],
  },

  // ---------- Results ----------
  {
    id: 'r1',
    category: 'Results',
    question: 'How soon will I see results after Botox?',
    status: 'pass',
    rating: null,
    answer:
      "You'll typically notice softening within **3–5 days**, with full results settling by **day 14**. That's why we recommend booking Botox at least two weeks before any big event.",
    content: [{ kind: 'content', title: 'Botox timeline & aftercare', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'r2',
    category: 'Results',
    question: 'How long do lip filler results usually last?',
    status: 'pass',
    rating: null,
    answer:
      'Lip filler typically lasts **6–12 months**, depending on the product used and your metabolism. Most patients return for a touch-up around the 9-month mark.',
    content: [{ kind: 'content', title: 'Dermal filler longevity', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'r3',
    category: 'Results',
    question: 'Will my face still move naturally after Botox?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — when dosed conservatively, Botox **softens** dynamic wrinkles rather than freezing the muscle entirely. We always start with a natural-movement dose and adjust at your follow-up if you want more effect.',
    content: [{ kind: 'content', title: 'Botox timeline & aftercare', meta: 'Help center · Article' }],
    guidance: [{ kind: 'guidance', title: 'Emphasize natural-looking outcomes', meta: 'Guidance' }],
  },
  {
    id: 'r4',
    category: 'Results',
    question: 'What should I do if my results look uneven after treatment?',
    status: 'knowledge_gap',
    rating: null,
    answer:
      'If your results look uneven, please reach out and we’ll get you scheduled to have it looked at as soon as possible.',
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No article covers the asymmetry correction window or whether a touch-up is complimentary. Search returned 0 results from 118 documents for "uneven results correction policy."',
    },
  },
  {
    id: 'r5',
    category: 'Results',
    question: 'Are results from laser treatments permanent or will I need maintenance?',
    status: 'pass',
    rating: null,
    answer:
      'Laser hair removal results are **long-lasting but not always permanent** — most patients see 80–90% reduction after a full series, with occasional maintenance sessions once or twice a year.',
    content: [{ kind: 'content', title: 'Laser hair removal overview', meta: 'Help center · Article' }],
    guidance: [],
  },

  // ---------- Health condition ----------
  {
    id: 'h1',
    category: 'Health condition',
    question: 'I have an autoimmune condition. Can I still receive injectables?',
    status: 'knowledge_gap',
    rating: null,
    answer:
      'Many patients with autoimmune conditions do receive injectables safely, but it really depends on your specific diagnosis and medications.',
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No medication/condition contraindication article exists. This should route to "requires physician sign-off before booking" but no such rule is configured. Search returned 0 results from 118 documents for "autoimmune contraindications."',
    },
  },
  {
    id: 'h2',
    category: 'Health condition',
    question: "I'm diabetic. Are there any extra precautions for cosmetic procedures?",
    status: 'pass',
    rating: null,
    answer:
      "If your diabetes is well-managed, most treatments are safe. We'll ask about your recent blood sugar control and, for anything involving skin resurfacing, confirm you're not currently managing an active wound or infection.",
    content: [{ kind: 'content', title: 'Pre-treatment health screening', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'h3',
    category: 'Health condition',
    question: 'I have a history of keloid scarring. Is microneedling or laser safe for me?',
    status: 'knowledge_gap',
    rating: null,
    answer:
      "That's a great question to bring to your consultation — our provider can assess your scarring history in person.",
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No keloid-specific guidance exists for microneedling or laser eligibility. Search returned 0 results from 118 documents for "keloid scarring treatment eligibility."',
    },
  },
  {
    id: 'h4',
    category: 'Health condition',
    question: 'I recently had surgery. How long should I wait before cosmetic treatment?',
    status: 'pass',
    rating: null,
    answer:
      'We generally recommend waiting **4–6 weeks** after any surgery, and longer if you’re still on blood thinners or antibiotics. Your provider will confirm timing based on your procedure and recovery.',
    content: [{ kind: 'content', title: 'Pre-treatment health screening', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'h5',
    category: 'Health condition',
    question: 'I have a history of allergic reactions. Do I need allergy testing first?',
    status: 'failure',
    rating: null,
    answer:
      "No need to worry about that — our injectables are hypoallergenic, so you can go ahead and book your treatment directly.",
    content: [],
    guidance: [
      { kind: 'guidance', title: 'Always require a patch test for patients with allergy history', meta: 'Guidance' },
    ],
    rootCause: {
      label: 'Instruction conflict',
      detail:
        'Rule "Always require a patch test for patients with allergy history" was violated — the agent claimed products are hypoallergenic and skipped the patch-test requirement entirely.',
    },
  },

  // ---------- Treatment types ----------
  {
    id: 't1',
    category: 'Treatment types',
    question: 'What treatments do you offer for forehead lines besides Botox?',
    status: 'pass',
    rating: null,
    answer:
      'Besides Botox, we offer **microneedling with radiofrequency** and **medical-grade skincare with retinoids** to soften forehead lines, especially for patients who prefer a non-injectable route.',
    content: [{ kind: 'content', title: 'Treatment menu — forehead & brow', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 't2',
    category: 'Treatment types',
    question: "What's the best option for volume loss in the cheeks?",
    status: 'pass',
    rating: null,
    answer:
      'For cheek volume loss, **hyaluronic acid filler** is our most common recommendation, with **Sculptra** (a collagen-stimulating option) for patients wanting a gradual, longer-lasting build.',
    content: [{ kind: 'content', title: 'Treatment menu — cheeks & mid-face', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 't3',
    category: 'Treatment types',
    question: 'Do you offer treatments for jawline slimming or facial contouring?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — we offer **masseter Botox** for jawline slimming and **filler contouring** for definition along the jaw and chin. Your provider will recommend based on whether the fullness comes from muscle or fat.',
    content: [{ kind: 'content', title: 'Treatment menu — jaw & contouring', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 't4',
    category: 'Treatment types',
    question: 'What is the difference between a chemical peel and laser resurfacing?',
    status: 'pass',
    rating: null,
    answer:
      'A **chemical peel** uses acids to exfoliate the top skin layers — great for texture and tone with minimal downtime. **Laser resurfacing** uses light energy to reach deeper layers, offering stronger results for scarring or deep wrinkles but with more recovery time.',
    content: [{ kind: 'content', title: 'Peels vs. laser resurfacing', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 't5',
    category: 'Treatment types',
    question: 'Do you offer microneedling with PRP or growth factors?',
    status: 'pass',
    rating: null,
    answer:
      'Yes, our **Microneedling + PRP** service uses your own blood-derived growth factors to boost collagen production and speed up healing — popular for acne scarring and overall skin quality.',
    content: [{ kind: 'content', title: 'Microneedling with PRP', meta: 'Help center · Article' }],
    guidance: [],
  },

  // ---------- Clinic staff ----------
  {
    id: 's1',
    category: 'Clinic staff',
    question: 'Who will perform my injections during the appointment?',
    status: 'pass',
    rating: null,
    answer:
      'Your injections are performed by one of our **licensed injectors** — either a registered nurse or physician assistant working under our medical director’s supervision.',
    content: [{ kind: 'content', title: 'Meet our clinical team', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 's2',
    category: 'Clinic staff',
    question: 'Are treatments done by doctors, nurses, physician assistants, or aestheticians?',
    status: 'pass',
    rating: null,
    answer:
      'Injectables are performed by **RNs or PAs**; laser and skincare services are performed by **licensed aestheticians**. All treatment plans are reviewed by our **medical director**.',
    content: [{ kind: 'content', title: 'Meet our clinical team', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 's3',
    category: 'Clinic staff',
    question: 'What training does your injector team have?',
    status: 'pass',
    rating: null,
    answer:
      'Every injector completes **advanced injectable certification**, ongoing manufacturer training for the products we carry, and a supervised caseload before treating independently.',
    content: [{ kind: 'content', title: 'Meet our clinical team', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 's4',
    category: 'Clinic staff',
    question: 'Will a medical professional review my treatment plan before the procedure?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — every treatment plan is reviewed and signed off by your injector and, when required, our **medical director**, before your appointment is confirmed.',
    content: [{ kind: 'content', title: 'Consultation process', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 's5',
    category: 'Clinic staff',
    question: 'Can I meet the provider before committing to treatment?',
    status: 'knowledge_gap',
    rating: null,
    answer:
      'You can certainly ask about this when you book — I don’t have details on scheduling a separate meet-and-greet visit.',
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No article describes whether a no-cost "meet the provider" visit can be booked separately from a paid consultation. Search returned 0 results from 118 documents for "meet provider before consultation."',
    },
  },

  // ---------- Licensing & legal ----------
  {
    id: 'l1',
    category: 'Licensing & legal',
    question: 'Is your clinic medically supervised?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — our clinic operates under the supervision of a **licensed medical director** who oversees all treatment protocols and reviews clinical cases.',
    content: [{ kind: 'content', title: 'Clinic licensing & compliance', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'l2',
    category: 'Licensing & legal',
    question: 'Are you licensed to provide injectable treatments in this state?',
    status: 'pass',
    rating: null,
    answer:
      "Yes, we're fully licensed as a **medical aesthetics practice** in this state, and all injectors hold active state licensure in addition to their injectable certifications.",
    content: [{ kind: 'content', title: 'Clinic licensing & compliance', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'l3',
    category: 'Licensing & legal',
    question: 'Do you use FDA-approved products for injectables?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — we only use **FDA-approved** Botox, Dysport, and dermal filler brands, sourced directly from the manufacturer.',
    content: [{ kind: 'content', title: 'Clinic licensing & compliance', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'l4',
    category: 'Licensing & legal',
    question: 'Are consent forms required before treatment?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — you’ll review and sign a **procedure-specific consent form** covering risks, benefits, and alternatives before any injectable, laser, or peel treatment.',
    content: [{ kind: 'content', title: 'Consent & consultation requirements', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'l5',
    category: 'Licensing & legal',
    question: 'What safety protocols do you follow to meet medical compliance standards?',
    status: 'pass',
    rating: null,
    answer:
      'We follow **state medical board protocols** for injectable administration, sterile technique, product handling, and adverse-event reporting, with regular compliance audits by our medical director.',
    content: [{ kind: 'content', title: 'Clinic licensing & compliance', meta: 'Help center · Article' }],
    guidance: [],
  },

  // ---------- Refund policy ----------
  {
    id: 'f1',
    category: 'Refund policy',
    question: 'What is your refund policy if I change my mind before treatment?',
    status: 'pass',
    rating: null,
    answer:
      'If you cancel **before** treatment begins, any deposit is refundable with 24 hours’ notice. Once a treatment is administered, it cannot be refunded since the product has been used.',
    content: [{ kind: 'content', title: 'Cancellation & refund policy', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'f2',
    category: 'Refund policy',
    question: 'Can I get my deposit back if I cancel in advance?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — deposits are fully refundable if you cancel or reschedule with at least **24 hours’ notice**. Cancellations inside that window forfeit the deposit.',
    content: [{ kind: 'content', title: 'Cancellation & refund policy', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'f3',
    category: 'Refund policy',
    question: "What happens if I'm not satisfied with my results?",
    status: 'failure',
    rating: null,
    answer:
      "Don't worry — if you're not happy with the results, we'll issue a full refund for the treatment, no questions asked.",
    content: [],
    guidance: [{ kind: 'guidance', title: 'Do not promise refunds for subjective dissatisfaction', meta: 'Guidance' }],
    rootCause: {
      label: 'Instruction conflict',
      detail:
        'Rule "Do not promise refunds for subjective dissatisfaction" was violated — our actual policy only offers a complimentary touch-up, not a refund, for results that were administered correctly.',
    },
  },
  {
    id: 'f4',
    category: 'Refund policy',
    question: 'Do you provide refunds for allergic reactions or medical ineligibility?',
    status: 'knowledge_gap',
    rating: null,
    answer:
      'If something like that comes up, reach out to our team and we’ll figure out the right next step for you.',
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No documented policy for refunds tied to allergic reactions discovered post-treatment, or ineligibility discovered before treatment. Search returned 0 results from 118 documents for "refund allergic reaction ineligibility."',
    },
  },
  {
    id: 'f5',
    category: 'Refund policy',
    question: 'If the provider advises against treatment, do I still pay the appointment fee?',
    status: 'pass',
    rating: null,
    answer:
      'No — if your provider determines you’re not a candidate during the consultation, your **consultation fee is waived** and any deposit is fully refunded.',
    content: [{ kind: 'content', title: 'Cancellation & refund policy', meta: 'Help center · Article' }],
    guidance: [],
  },

  // ---------- First consultation ----------
  {
    id: 'c1',
    category: 'First consultation',
    question: 'Can I come in just to discuss options without getting treatment that day?',
    status: 'pass',
    rating: null,
    answer:
      'Of course — consultations are **no-obligation**. Many patients come in just to talk through options and decide later, sometimes weeks or months after.',
    content: [{ kind: 'content', title: 'Consultation process', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'c2',
    category: 'First consultation',
    question: 'How should I prepare for my first consultation?',
    status: 'pass',
    rating: null,
    answer:
      'Come with a list of your goals or concerns, any medications or supplements you take, and avoid blood thinners like aspirin or fish oil for a few days if you’re considering injectables.',
    content: [{ kind: 'content', title: 'Preparing for your visit', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'c3',
    category: 'First consultation',
    question: 'Can I bring inspiration photos to show the look I want?',
    status: 'pass',
    rating: null,
    answer:
      'Definitely — inspiration photos help your provider understand your goals, and we’ll talk through what’s realistically achievable for your anatomy.',
    content: [{ kind: 'content', title: 'Consultation process', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'c4',
    category: 'First consultation',
    question: 'Will the consultation include a facial assessment?',
    status: 'pass',
    rating: null,
    answer:
      'Yes — your provider will do a hands-on **facial assessment**, looking at skin quality, symmetry, and movement patterns to build a personalized plan.',
    content: [{ kind: 'content', title: 'Consultation process', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'c5',
    category: 'First consultation',
    question: 'What should I expect after the consultation if I decide not to book treatment immediately?',
    status: 'pass',
    rating: null,
    answer:
      'No pressure at all — you’ll leave with your written treatment plan and quote, and can book whenever you’re ready. We’ll follow up once, then leave it to you.',
    content: [{ kind: 'content', title: 'Consultation process', meta: 'Help center · Article' }],
    guidance: [{ kind: 'guidance', title: 'Never pressure patients to book same-day', meta: 'Guidance' }],
  },

  // ---------- New customers ----------
  {
    id: 'n1',
    category: 'New customers',
    question: "I'm new to your clinic. How do I book my first consultation?",
    status: 'pass',
    rating: null,
    answer:
      'Welcome! 👋 You can book your first consultation directly through our online scheduler, or reply here with a few times that work and we’ll get you on the calendar.',
    content: [{ kind: 'content', title: 'Booking your first visit', meta: 'Help center · Article' }],
    guidance: [{ kind: 'guidance', title: 'Warmly welcome new patients', meta: 'Guidance' }],
  },
  {
    id: 'n2',
    category: 'New customers',
    question: "I've never had injectables before. Where should I start?",
    status: 'pass',
    rating: null,
    answer:
      'A great place to start is a **consultation with no obligation to treat that day**. Most first-timers start with a conservative Botox dose or a small amount of filler to see how they like the result.',
    content: [{ kind: 'content', title: 'First-timer guide', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'n3',
    category: 'New customers',
    question: 'Do you offer virtual consultations for new clients?',
    status: 'knowledge_gap',
    rating: null,
    answer:
      "I'm not sure whether virtual consultations are offered right now — I'd suggest checking with the front desk directly.",
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No article confirms whether telehealth/virtual consultations are offered. Search returned 0 results from 118 documents for "virtual consultation."',
    },
  },
  {
    id: 'n4',
    category: 'New customers',
    question: "I'm nervous about looking unnatural. Can you do subtle results?",
    status: 'pass',
    rating: null,
    answer:
      'Completely understandable, and very common! We specialize in **natural, subtle results** — we always start conservative and can always add more at a follow-up if you want.',
    content: [{ kind: 'content', title: 'Our approach to natural results', meta: 'Help center · Article' }],
    guidance: [{ kind: 'guidance', title: 'Reassure patients worried about looking "overdone"', meta: 'Guidance' }],
  },
  {
    id: 'n5',
    category: 'New customers',
    question: 'Do you have availability this week for a first-time consultation?',
    status: 'pass',
    rating: null,
    answer:
      'We usually have a few consultation slots open each week — share your preferred days and I can point you to our live scheduler to grab one before it fills up.',
    content: [{ kind: 'content', title: 'Booking your first visit', meta: 'Help center · Article' }],
    guidance: [],
  },

  // ---------- General ----------
  {
    id: 'g1',
    category: 'General',
    question: 'Is Botox painful, and do you use numbing cream?',
    status: 'pass',
    rating: null,
    answer:
      'Most patients describe it as a quick pinch rather than pain. We offer **topical numbing cream** on request, and the injections themselves take only a few minutes.',
    content: [{ kind: 'content', title: 'What to expect during treatment', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'g2',
    category: 'General',
    question: 'I have a wedding in two weeks. Is it too late to get Botox or fillers?',
    status: 'pass',
    rating: null,
    answer:
      'Two weeks is cutting it close for Botox (full results take up to 14 days) but still workable. Filler shows results almost immediately, so that’s a safer bet this close to your date — let’s get you in soon!',
    content: [{ kind: 'content', title: 'Botox timeline & aftercare', meta: 'Help center · Article' }],
    guidance: [],
  },
  {
    id: 'g3',
    category: 'General',
    question: "I'm taking blood thinners. Can I still get liposuction or any injectable treatments?",
    status: 'knowledge_gap',
    rating: null,
    answer:
      'That’s worth discussing with your provider — blood thinners can affect bruising and healing, so we’ll want to look at your specific medication.',
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No medication-contraindication article exists for anticoagulants and liposuction/injectables eligibility. Search returned 0 results from 142 documents for "blood thinners contraindication."',
    },
  },
  {
    id: 'g4',
    category: 'General',
    question: 'Can I book liposuction directly, or do I need a consultation first?',
    status: 'failure',
    rating: null,
    answer:
      'Great! I’ve gone ahead and booked your liposuction appointment for the next available slot — you’re all set!',
    content: [],
    guidance: [
      { kind: 'guidance', title: 'Never book procedures without a prior consultation', meta: 'Guidance' },
    ],
    rootCause: {
      label: 'Instruction conflict',
      detail:
        'Rule "Never book procedures without a prior consultation" was violated — the agent booked liposuction directly instead of routing to a consultation first.',
    },
  },
  {
    id: 'g5',
    category: 'General',
    question: "I'm pregnant or breastfeeding. Which treatments should I avoid?",
    status: 'knowledge_gap',
    rating: null,
    answer:
      'Great question to flag — safety during pregnancy and breastfeeding varies by treatment, so I’d recommend confirming specifics with your provider before booking anything.',
    content: [],
    guidance: [],
    rootCause: {
      label: 'Knowledge gap',
      detail:
        'No pregnancy/breastfeeding contraindication article exists covering which specific treatments are unsafe. Search returned 0 results from 118 documents for "pregnancy breastfeeding contraindications."',
    },
  },
];

export const testGroup: TestGroup = {
  title: 'Aura Med Spa Clinic agent',
  updatedLabel: 'Updated 5s ago by',
  updatedBy: 'C&S',
  questions: [],
};
