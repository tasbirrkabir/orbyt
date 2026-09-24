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
  sub: "This is your ORBYT workspace. Project history, your system profile, and every message you've sent us, in one place.",
  cards: {
    profile: {
      title: "Your system profile",
      sub: "What you told us during onboarding.",
      edit: "Update profile",
      empty: "You haven't completed onboarding yet. It takes two minutes and it makes every future project faster.",
      emptyCta: "Start onboarding",
      fields: {
        company: "Company",
        industry: "Industry",
        stage: "Stage",
        challenges: "Friction points",
        tools: "Tools",
        goal: "90-day goal",
        focus: "First focus",
      },
      notSet: "Not set",
    },
    messages: {
      title: "Project conversations",
      sub: "Every message you've sent through the contact flow.",
      empty: "No messages yet. When something's worth solving, you know where to find us.",
      emptyCta: "Start a project",
      topicLabel: "Topic",
      sentLabel: "Sent",
    },
    next: {
      title: "Where this goes",
      sub: "Your profile shapes our first conversation. From here, the process takes over.",
      steps: [
        "Send the first brief through the contact flow.",
        "We reply with an honest read, not a sales script.",
        "If it fits: a short call, then a system map.",
      ],
      cta: { label: "Start a project", href: "/contact" },
    },
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
