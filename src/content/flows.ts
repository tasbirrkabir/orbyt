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
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgot: "Forgot your password?",
    forgotLink: "Reset it here.",
    invalid: "Those details don't match. Check the client ID, the email and the password.",
    error: "Login is unavailable right now. Try again in a minute.",
    mfaTitle: "Two-step verification.",
    mfaSub: "This account asks for a second step. Enter the 6-digit code from your authenticator app, or one of your backup codes.",
    mfaLabel: "Code",
    mfaPlaceholder: "000000",
    mfaSubmit: "Verify and open my portal",
    mfaWrong: "That code didn't match. Try the newest one in the app, or a backup code.",
    mfaBack: "Go back and re-enter my password",
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
  forgot: {
    title: "Reset your password.",
    sub: "Enter the email on your ORBYT account and we'll send a link to choose a new one.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    submit: "Send the reset link",
    sending: "Sending",
    sentTitle: "Check the inbox.",
    sentBody: "If that address is on an ORBYT account, a reset link is on its way. It works once, for 30 minutes.",
    error: "That didn't go through. Try again in a minute.",
    backToLogin: "Back to sign in",
  },
  reset: {
    title: "Reset your password.",
    sub: "Enter the email on your ORBYT account and we'll send a link to choose a new one.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    submit: "Send the reset link",
    submitting: "Sending",
    sentTitle: "Check the inbox.",
    sentBody: "If that address is on an ORBYT account, a reset link is on its way. It works once, for 30 minutes.",
    resent: "Another link is on its way.",
    requestError: "That didn't go through. Try again in a minute.",
    backToLogin: "Back to sign in",
    confirmTitle: "Choose a new password.",
    confirmSub: "This link works once. New password needs at least 8 characters.",
    passwordLabel: "New password",
    passwordPlaceholder: "At least 8 characters",
    confirmLabel: "Type it again",
    mismatch: "The two passwords don't match.",
    confirmSubmit: "Save the new password",
    confirmSubmitting: "Saving",
    doneTitle: "Password saved.",
    doneBody: "Sign in with the new password. Any other open session was signed out.",
    expired: "This link has expired or was already used. Ask for a fresh one below.",
    linkExpired: "Expired or used link.",
    sendNew: "Send me a fresh link",
    confirmError: "That didn't go through. Try again in a minute.",
    error: "That didn't go through. Try again in a minute.",
    invalidLink: "This reset link has expired or was already used.",
    requestNew: "Ask for a fresh link",
    doneCta: "Sign in with the new password",
    passwordHint: "At least 10 characters. Mix in a number or a symbol.",
    saving: "Saving",
  },
  activate: {
    title: "Choose your password.",
    sub: "Your workspace is ready. Pick a password to open the door. It needs at least 8 characters.",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmLabel: "Type it again",
    mismatch: "The two passwords don't match.",
    submit: "Open my workspace",
    submitting: "Opening",
    doneTitle: "You're in.",
    doneBody: "Your password is set. Sign in with the client ID from your email, this email address and the password you just chose.",
    yourClientId: "Your client ID",
    expired: "This invite link has expired or was already used. Reply to the welcome email and we'll send a fresh one.",
    linkExpired: "Expired or used invite.",
    backToLogin: "Back to sign in",
    error: "That didn't go through. Try again in a minute.",
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
    cancel: "Keep it as is",
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
