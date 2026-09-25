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
    note: "Three sample workspaces, one for each service shape: website only (ORB-DEMO), website plus marketing (ORB-NOVA), full service (ORB-ATLAS). Same password rule, all sample data, nothing to clean up after.",
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
  console: {
    workspace: "ORBYT // WORKSPACE",
    active: "SYSTEM: ACTIVE",
    standby: "SYSTEM: STANDING BY",
    verified: "SESSION: VERIFIED",
    locked: "SESSION: LOCKED",
    zone: "DHAKA",
  },
} as const;

/**
 * Copy still served from the legacy flows: the deliverables index and
 * the approval error line. Everything else moved to command.ts.
 */
export const PORTAL = {
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
  approve: {
    error: "Couldn't save the approval. Try again in a minute.",
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
