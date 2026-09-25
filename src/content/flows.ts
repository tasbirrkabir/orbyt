/**
 * ORBYT flow copy: authentication, onboarding, dashboard.
 * Same voice as the rest of the site. Zero em-dashes. Nothing invented.
 */

export const AUTH = {
  login: {
    title: "Welcome back.",
    sub: "Log in to your ORBYT workspace.",
    submit: "Log in",
    submitting: "Checking",
    noAccount: "New here?",
    switchToRegister: "Create an account",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    forgot: "Forgot your password? Email us from the contact page and we'll sort it out.",
    invalid: "Email or password didn't match. Try again.",
    error: "Login is unavailable right now. Try again in a minute.",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  register: {
    title: "Create your ORBYT account.",
    sub: "One account for projects, onboarding and everything we build together.",
    submit: "Create account",
    submitting: "Creating",
    haveAccount: "Already have an account?",
    switchToLogin: "Log in instead",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordHint: "At least 8 characters. A phrase beats a symbol soup.",
    passwordPlaceholder: "Create a password",
    nameRequired: "Tell us your name",
    emailInvalid: "That email doesn't look right",
    passwordShort: "8 characters minimum",
    emailTaken: "An account with this email already exists. Try logging in.",
    error: "Registration is unavailable right now. Try again in a minute.",
  },
  shared: {
    orDivider: "or",
    backHome: "Back to the homepage",
    welcomeNew: "Account created. Let's set up your workspace.",
  },
} as const;

export const ONBOARDING = {
  title: "Set up your workspace.",
  sub: "Four short steps. This tells us where to look first when we start working together.",
  progressLabels: ["You", "The friction", "The goal", "Review"],
  edit: "You can update this any time from your dashboard.",
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
      sub: "You can change any of this later from your dashboard.",
      submit: "Save and open my workspace",
      submitting: "Saving",
      successTitle: "Workspace ready.",
      success:
        "Your system profile is saved. When you start a project conversation, we'll already know where to look.",
      toDashboard: "Open my dashboard",
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
    days: {
      label: "Days in the system",
      hint: "Counted from the day you joined.",
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
  signOut: "Log out",
  signedInAs: "Signed in as",
} as const;

export const PROTECTED = {
  redirecting: "Checking your session",
  needLogin: {
    title: "This page needs an account.",
    body: "It's where your project profile and conversations live. Logging in takes a few seconds.",
    login: "Log in",
    register: "Create an account",
  },
} as const;
