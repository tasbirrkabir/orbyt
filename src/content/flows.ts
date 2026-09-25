/**
 * ORBYT flow copy: authentication, onboarding, dashboard.
 * Same voice as the rest of the site. Zero em-dashes. Nothing invented.
 */

export const AUTH = {
  login: {
    title: "Client portal.",
    sub: "Log in with the client ID from your welcome email, plus your email and password.",
    clientIdLabel: "Client ID",
    clientIdPlaceholder: "ORB-XXXX",
    clientIdHint: "Issued by email when your project starts. Lost it? We'll re-send it.",
    submit: "Open my portal",
    submitting: "Checking",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    forgot: "Forgot your password? Email us from the contact page and we'll sort it out.",
    invalid: "Those details don't match. Check the client ID, the email and the password.",
    error: "Login is unavailable right now. Try again in a minute.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    noIdTitle: "No client ID yet?",
    noIdBody:
      "Portal access starts with a project. Tell us what's slowing growth down, and if we build together, your ID arrives with the welcome email.",
    noIdCta: "Start a project",
  },
  shared: {
    orDivider: "or",
    backHome: "Back to the homepage",
  },
  demo: {
    eyebrow: "JUST LOOKING?",
    label: "Explore the demo portal",
    submitting: "Opening the demo",
    ready: "Demo portal ready.",
    credentialsLabel: "Demo login",
    note: "Sample client, sample project, sample updates, the real layout. No signup, no email, nothing to clean up after.",
    error: "The demo didn't open. Try again in a minute.",
  },
} as const;

export const ONBOARDING = {
  title: "Set up your workspace.",
  sub: "Four short steps. This tells us where to look first when we start working together.",
  progressLabels: ["You", "The friction", "The goal", "Review"],
  edit: "You can update this any time from your workspace.",
  steps: {
    you: {
      label: "You",
      title: "First, the basics.",
      companyLabel: "Company or project",
      companyPlaceholder: "What are we building for?",
      industryLabel: "Industry",
      industryPlaceholder: "Pick the closest",
      industries: [
        "eCommerce",
        "SaaS",
        "Professional services",
        "Education",
        "Health",
        "Local business",
        "Something else",
      ] as const,
      stageLabel: "Where is the business today?",
      stagePlaceholder: "Pick the closest",
      stages: [
        "Just starting",
        "Growing steadily",
        "Established, optimizing",
        "Scaling fast",
      ] as const,
    },
    friction: {
      label: "The friction",
      title: "What's slowing growth down?",
      titleSub: "Pick everything that stings. We'll start there.",
      challengesLabel: "Friction points",
      challenges: [
        "Leads go cold before anyone replies",
        "The team drowns in manual busywork",
        "Ads spend, but the data can't be trusted",
        "The website doesn't convert",
        "Tools that don't talk to each other",
        "No clear numbers on what works",
      ] as const,
      toolsLabel: "What tools run the business today?",
      toolsPlaceholder:
        "Rough list is fine: CRM, ads platform, website builder, spreadsheets...",
      toolsHint: "This helps us map your system before we ever meet.",
    },
    goal: {
      label: "The goal",
      title: "And where should this go?",
      goalLabel: "What would progress look like in 90 days?",
      goalPlaceholder:
        "One or two sentences. Concrete beats ambitious: 'replies to every lead within an hour' beats 'more growth'.",
      focusLabel: "Where should ORBYT focus first?",
      focusPlaceholder: "Optional. If you already know, tell us.",
    },
    review: {
      label: "Review",
      title: "Quick check before we save it.",
      sub: "You can change any of this later from your workspace.",
      submit: "Save and open my workspace",
      submitting: "Saving",
      successTitle: "Workspace ready.",
      success:
        "Your system profile is saved. When you start a project conversation, we'll already know where to look.",
      toWorkspace: "Open my workspace",
    },
  },
  errors: {
    generic: "Saving failed. Try again in a minute.",
    required: "This one's needed",
    pickOne: "Pick at least one",
  },
} as const;

export const DASHBOARD = {
  greeting: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
  sub: "One portal for the whole relationship. Approve what ships, track what's delivered, and reach the desk in one move.",
  console: {
    workspace: "ORBYT // WORKSPACE",
    active: "SYSTEM: ACTIVE",
    standby: "SYSTEM: STANDING BY",
    verified: "SESSION: VERIFIED",
    locked: "SESSION: LOCKED",
    zone: "DHAKA",
  },
  tenure: {
    prefix: "Day",
    since: "Building together since",
  },
  stats: {
    messages: {
      label: "Messages sent",
      hint: "Every brief you've put on our desk.",
    },
    completion: {
      label: "Profile complete",
      hint: "How much of your system we can already see.",
    },
    projects: {
      label: "Projects",
      hint: "Builds currently on our desk.",
    },
    approvals: {
      label: "Awaiting approval",
      hint: "Shipped work waiting on your sign-off.",
    },
    friction: {
      label: "Friction mapped",
      hint: "Points you flagged during onboarding.",
    },
  },
  map: {
    eyebrow: "System map",
    title: "Your friction, routed to the right desk.",
    sub: "Each point you flagged during onboarding, mapped to the ORBYT pillar that owns it. This is where a first project would start.",
    core: "YOUR SYSTEM",
    coreEmpty: "UNMAPPED",
    routing: "Routing",
    empty:
      "The map lights up after onboarding. Two minutes, a handful of questions, and we know exactly where to look first.",
    emptyCta: "Run onboarding",
    legendActive: "Mapped focus",
    legendIdle: "Standing by",
    note: "Derived from your onboarding answers. It sharpens as we learn more about the business.",
  },
  conversations: {
    title: "Project conversations",
    sub: "Everything you've sent us, from the contact flow or right here in the portal, newest first.",
    sent: "Sent",
    show: "Show full message",
    hide: "Collapse",
    empty: "Nothing here yet. When something is worth solving, you know where to find us.",
    emptyCta: "Start a project",
  },
  profile: {
    title: "Your system profile",
    sub: "What we know going into every conversation.",
    fieldsCount: "of 6 fields on file",
    edit: "Update profile",
    empty: "No profile yet. Onboarding takes two minutes and makes every future conversation faster.",
    emptyCta: "Start onboarding",
    updated: "Updated",
    fields: {
      company: "Company",
      industry: "Industry",
      stage: "Stage",
      challenges: "Friction points",
      tools: "Tools",
      goal: "90-day goal",
    },
    notSet: "Not set",
  },
  steps: {
    title: "The path from here",
    sub: "Honest state, no gamified nonsense. It updates as you move.",
    doneLabel: "DONE",
    queuedLabel: "QUEUED",
    items: {
      onboard: "Set up your workspace",
      onboardDone: "Workspace set up",
      map: "Flag your friction points",
      mapDone: "Friction points flagged",
      brief: "Send the first brief",
      briefDone: "First brief on our desk",
      call: "Take the fit call",
      callNote:
        "We reply to every brief with an honest read, not a sales script. If it fits, this is where it goes.",
    },
    cta: { label: "Start a project", href: "/contact" },
    ctaReady: { label: "Book the fit call", href: "/contact" },
  },
  demo: {
    tag: "DEMO PORTAL",
    body: "You're looking at sample data so you can see how the portal behaves with a live project in it. Become a client and these rooms fill with yours.",
    cta: "Start a project",
  },
  signOut: "Log out",
  signedInAs: "Signed in as",
} as const;

/**
 * Project portal copy: a six room workspace, not one long screen. Each
 * section answers one question a client actually asks.
 */
export const PORTAL = {
  clientIdLine: "CLIENT ID",
  nav: {
    label: "Portal sections",
    overview: { label: "Overview", href: "/workspace" },
    project: { label: "Project", href: "/workspace/project" },
    deliverables: { label: "Deliverables", href: "/workspace/deliverables" },
    messages: { label: "Messages", href: "/workspace/messages" },
    support: { label: "Support", href: "/workspace/support" },
    profile: { label: "Profile", href: "/workspace/profile" },
  },
  overview: {
    attention: {
      label: "Needs your attention",
      approvalsOne: "One shipped update is waiting on your sign-off.",
      approvalsMany: (count: number) =>
        `${count} shipped updates are waiting on your sign-off.`,
      approvalsCta: "Review and approve",
      latestLabel: "Latest from the crew",
      latestCta: "Open the project log",
      allClear:
        "Nothing is waiting on you. The crew keeps building, and this screen is where you'll hear about it first.",
    },
    quick: {
      label: "The rest of the portal",
      sub: "Five rooms, each one answerable in a sentence. Pick the one you need.",
      items: {
        project: {
          title: "The project",
          desc: "The stage rail, the full crew log, and your approvals.",
        },
        deliverables: {
          title: "Deliverables",
          desc: "Every file and doc: what's delivered, what's in prep.",
        },
        messages: {
          title: "Messages",
          desc: "Notes to the crew, and every note you've sent.",
        },
        support: {
          title: "Support",
          desc: "Response times, check-in calls, straight answers.",
        },
        profile: {
          title: "Profile",
          desc: "What we know about your system, and the friction map.",
        },
      },
    },
  },
  projectPage: {
    eyebrow: "PORTAL / PROJECT",
    title: "The project.",
    sub: "Where it stands in the six stage loop, the full crew log, and the updates waiting on your sign-off.",
    brief: {
      label: "The brief",
      title: "What we're building toward.",
      sub: "Your words from onboarding, kept in front of both of us. This is the standard the work gets measured against.",
      empty:
        "No brief on file yet. Onboarding takes two minutes and gives the work its target.",
      emptyCta: "Write the brief",
      profileCta: "Open the full profile",
    },
  },
  deliverables: {
    eyebrow: "PORTAL / DELIVERABLES",
    title: "Everything we've handed over.",
    sub: "The index of what exists: files, maps and documents, what's delivered, and what's still on the bench.",
    note: "Files travel by email. This page tracks what was sent and when, so nothing lives in one inbox or one person's memory.",
    sections: { delivered: "Delivered", inPrep: "In prep" },
    channelLabel: "BY EMAIL",
    deliveredOn: "Delivered",
    openLabel: "Open",
    inPrepNote: "Expected in your inbox as the work clears testing.",
    emptyTitle: "Nothing delivered yet.",
    empty:
      "When work ships, every file and document lands here with the date it reached your inbox. No hunting through threads.",
  },
  messagesPage: {
    eyebrow: "PORTAL / MESSAGES",
    title: "Messages.",
    sub: "Write to the crew, and read back everything you've sent. Replies land in your email, usually within one business day.",
  },
  profilePage: {
    eyebrow: "PORTAL / PROFILE",
    title: "Your system profile.",
    sub: "What we know going into every conversation, and the map that routes your friction to the right desk.",
  },
  support: {
    eyebrow: "PORTAL / SUPPORT",
    title: "How to reach the desk.",
    sub: "One desk, real people, and a reply time we hold ourselves to. No ticket numbers, no runaround.",
    promise: {
      title: "One business day. That's the standard.",
      body: "Every note lands on the same desk, whether it starts here or on the contact page. A real person reads it and replies by email, usually within one business day. If a reply is ever late, say the word and it jumps the queue.",
    },
    channels: {
      label: "Two ways in",
      portal: {
        title: "A note in the portal",
        desc: "The fastest route. It lands on the desk with your project context already attached.",
        cta: "Write a note",
      },
      contact: {
        title: "The contact page",
        desc: "For anything new: a fresh problem, a second project, or someone else on your team asking.",
        cta: "Go to contact",
      },
    },
    checkin: {
      label: "Check-in call",
      title: "Want time with the crew?",
      sub: "Request a check-in and we'll confirm a slot by email. No calendar bots, no booking maze: a human writes back with a time.",
      dayLabel: "Which day works?",
      days: ["Any day", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      windowLabel: "Time of day?",
      windows: ["Morning", "Afternoon"],
      agendaLabel: "What should we cover?",
      agendaPlaceholder:
        "Optional. A line or two, so the call starts in the right place.",
      submit: "Request the check-in",
      submitting: "Sending",
      sent: "Request sent. We'll confirm a time by email.",
      error: "The request didn't send. Try again in a minute.",
      required: "Pick a day and a time window first",
    },
    faq: {
      label: "Straight answers",
      items: [
        {
          q: "Where do my files live?",
          a: "They travel by email, and the Deliverables page is the index: what was sent, when, and what's inside. If something is missing from both, tell us and we'll re-send it the same day.",
        },
        {
          q: "How do approvals work?",
          a: "When something ships, it shows up in your project log marked SHIPPED. You read it, and if it landed right, you approve it. Your sign-off goes on record with the date, so both sides know exactly what was accepted and when.",
        },
        {
          q: "How does billing work?",
          a: "Invoices go out by email and payment happens by bank transfer. This portal never asks for a card and never processes a payment. If a number ever looks off, reply to the invoice and a human sorts it out.",
        },
        {
          q: "Lost your client ID or password?",
          a: "Send a note from the contact page. We verify it's you, then re-send the ID or reset the password the same day. Nobody on our side can see your password, by design.",
        },
        {
          q: "Something is on fire?",
          a: "Mark your note with the 'New priority' topic and put the fire in the first line. Urgent things move first; that's the whole system.",
        },
      ],
    },
  },
  projects: {
    title: "Project updates",
    sub: "Straight from the crew: what shipped, what's wiring next, what we're watching. Approve what's done, and it's on record.",
    projectLabel: "PROJECT",
    stageLabel: "Stage",
    startedLabel: "Started",
    updatesLabel: "Updates",
    awaiting: (count: number) =>
      count === 1
        ? "1 shipped update is waiting on your approval"
        : `${count} shipped updates are waiting on your approval`,
    emptyTitle: "No projects on file yet.",
    empty:
      "The portal fills in when work starts. If your project is already running and this looks empty, email us and we'll sort it the same day.",
    emptyCta: { label: "Start a project", href: "/contact" },
  },
  approve: {
    button: "Approve",
    approving: "Saving",
    approved: "APPROVED",
    error: "Couldn't save the approval. Try again in a minute.",
    hint: "Sign off so the crew knows it landed right",
  },
  messages: {
    title: "Message the crew",
    sub: "Notes land on the same desk as the contact form. We reply by email, usually within one business day.",
    topicLabel: "What is this about?",
    topics: ["Portal note", "Check-in request", "Question", "New priority"],
    projectLabel: "About a project?",
    projectNone: "No specific project",
    label: "Your note",
    placeholder: "What changed on your side, what you need, what's on your mind.",
    required: "Write a line or two first",
    submit: "Send the note",
    submitting: "Sending",
    sent: "Note sent. It's on the desk.",
    error: "The note didn't send. Try again in a minute.",
  },
} as const;

export const PROTECTED = {
  redirecting: "Checking your session",
  gate: {
    eyebrow: "PORTAL ACCESS",
    sub: "The workspace opens right here once you're in. No redirect, no detour.",
    noId: "No client ID yet?",
    noIdCta: "Start a project",
    noIdTail:
      "Portal access starts with a project, and your ID arrives with the welcome email.",
  },
  needLogin: {
    title: "This portal needs a client account.",
    body: "Project updates, your system profile and every brief you've sent live here. Log in with the client ID from your welcome email.",
    login: "Log in",
    project: "Start a project",
  },
} as const;
