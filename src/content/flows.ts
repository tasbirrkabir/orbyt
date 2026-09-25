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
  sub: "One screen for the whole relationship. Your system profile, every message you've sent us, and where each one points next.",
  console: {
    workspace: "ORBYT // WORKSPACE",
    active: "SYSTEM: ACTIVE",
    verified: "SESSION: VERIFIED",
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
    sub: "Every message you've sent through the contact flow, newest first.",
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
  actions: {
    label: "Quick moves",
    start: { label: "Start a project", href: "/contact" },
    profile: { label: "Update profile", href: "/onboarding" },
    insights: { label: "Read the insights", href: "/insights" },
  },
  demo: {
    tag: "DEMO PORTAL",
    body: "You're looking at sample data so you can see how the portal behaves with a live project in it. Become a client and this screen fills with yours.",
    cta: "Start a project",
  },
  signOut: "Log out",
  signedInAs: "Signed in as",
} as const;

/** Project portal copy: the updates feed clients actually log in for. */
export const PORTAL = {
  clientIdLine: "CLIENT ID",
  projects: {
    title: "Project updates",
    sub: "Straight from the crew: what shipped, what's wiring next, what we're watching. Updates land here as the work moves.",
    projectLabel: "PROJECT",
    stageLabel: "Stage",
    startedLabel: "Started",
    updatesLabel: "Updates",
    emptyTitle: "No projects on file yet.",
    empty:
      "The portal fills in when work starts. If your project is already running and this looks empty, email us and we'll sort it the same day.",
    emptyCta: { label: "Start a project", href: "/contact" },
  },
} as const;

export const PROTECTED = {
  redirecting: "Checking your session",
  needLogin: {
    title: "This portal needs a client account.",
    body: "Project updates, your system profile and every brief you've sent live here. Log in with the client ID from your welcome email.",
    login: "Log in",
    project: "Start a project",
  },
} as const;
