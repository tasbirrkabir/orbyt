/**
 * ORBYT CLIENT COMMAND CENTER copy.
 *
 * The panel is deliberately small: the project and how far it has come,
 * the invoices and how to pay them, and one way to reach the desk.
 * Voice rules of the house: calm, direct, human, zero em-dashes,
 * nothing invented.
 */

export const COMMAND = {
  shell: {
    wordmark: "ORBYT // COMMAND CENTER",
    navLabel: "Portal sections",
    account: {
      signedInAs: "Signed in as",
      logOut: "Log out",
      clientLabel: "CLIENT ID",
    },
    mobile: {
      menu: "Menu",
    },
  },

  nav: {
    project: { label: "Project", href: "/workspace" },
    invoices: { label: "Invoices", href: "/workspace/invoices" },
    contact: { label: "Contact", href: "/workspace/contact" },
  },

  states: {
    loading: "Loading",
    error: "We couldn't load this page.",
    errorBody: "Give it a minute and try again. If it keeps failing, the contact page has the fastest way to reach the desk.",
    retry: "Try again",
  },

  demoNote: {
    tag: "DEMO DATA",
    body: "You're looking at a sample client so you can see how the panel behaves with live work in it. Become a client and these rooms fill with yours.",
  },

  project: {
    eyebrow: "COMMAND CENTER",
    sub: "How far along the work is, what's done, and what's next.",
    labels: {
      progress: "Project progress",
      nextMilestone: "Next milestone",
      targetLaunch: "Target launch",
      started: "Started",
      owner: "Owned by",
      goal: "The goal",
      health: "Project health",
    },
    health: {
      notSet: "Not assessed yet. The crew records the first health check after kickoff.",
      noteLabel: "Why",
      setAt: (when: string) => `Recorded ${when}`,
    },
    noGoal: "No written goal yet. The crew adds one after discovery.",
    noProjectTitle: "No project on file yet.",
    noProjectBody: "When work starts, the project, its stage and its progress appear right here.",
    milestones: {
      label: "The rail",
      sub: "Progress counts finished milestones. Nothing here is hand-typed.",
      empty: "Milestones appear here once the crew maps the work.",
      done: "Done",
      active: "In motion",
      upcoming: "Ahead",
    },
    crewLog: {
      label: "Crew log",
      sub: "Straight from the people doing the work. Sign off what landed right.",
      awaiting: "Awaiting your sign-off",
      approved: "Approved",
      approve: "Approve",
      approving: "Saving",
      empty: "No updates yet. As work happens, the crew logs it here.",
    },
    scope: {
      label: "Scope",
      sub: "What this engagement includes, and what it does not. Changes go through the desk, never a silent edit.",
      included: "Included",
      excluded: "Explicitly out",
      empty: "Scope is being written up. It appears here once discovery wraps.",
    },
    billingStrip: {
      label: "INVOICES",
      outstanding: (money: string) => `${money} outstanding`,
      square: "Nothing due. You're square with the desk.",
      cta: "Open invoices",
    },
  },

  invoices: {
    eyebrow: "COMMAND CENTER / INVOICES",
    title: "Invoices.",
    sub: "Every invoice and its status in the open. The portal never processes a payment.",
    how: {
      title: "How payment works",
      steps: [
        "Invoices go out by email, and the same details live on this page.",
        "Pay by bank transfer or bKash using the account details printed on the invoice.",
        "Report the payment here with the reference. A human on the crew confirms receipt and marks the invoice paid.",
      ],
    },
    summary: {
      outstanding: "Outstanding",
      paidThisYear: "Paid this year",
    },
    pending: "Due",
    settled: "Paid and settled",
    labels: {
      number: "Invoice",
      issued: "Issued",
      due: "Due",
      paidOn: "Paid on",
    },
    payNote: "Pay by bank transfer or bKash using the details in the emailed invoice.",
    reportCta: "Report payment",
    reported: "Payment reported · awaiting confirmation",
    reportDialog: {
      title: "Report a payment",
      description: (money: string, number: string) =>
        `${money} on ${number}. This tells the crew money is on the way; the invoice is marked paid only after ORBYT confirms receipt.`,
      methodLabel: "How did you pay?",
      referenceLabel: "Reference (transaction ID, transfer slip...)",
      referencePlaceholder: "Optional, but it helps",
      submit: "Report the payment",
    },
    methods: {
      BANK_TRANSFER: "Bank transfer",
      BKASH: "bKash",
      NAGAD: "Nagad",
      CARD: "Card",
    } as Record<string, string>,
    emptyPending: "Nothing due. You're square with the desk.",
    emptySettled: "No settled invoices yet.",
    emptyTitle: "No invoices yet.",
    empty: "Invoices appear here as work hits milestones.",
    viewerNote: "Read-only seat: payments get reported by an owner or member.",
  },

  contact: {
    eyebrow: "COMMAND CENTER / CONTACT",
    title: "Talk to the desk.",
    sub: "One desk, real people. Replies go out by email, usually within one business day.",
    promise:
      "Every note lands on the same desk the crew works from. No ticket maze: a human reads it and replies by email, usually within one business day.",
    form: {
      subjectLabel: "Subject",
      subjectPlaceholder: "What is this about?",
      messageLabel: "Your note",
      messagePlaceholder: "What changed on your side, what you need, what's on your mind.",
      submit: "Send it",
      submitting: "Sending",
      sent: "Sent. It's on the desk. Replies land here and in your inbox.",
    },
    elsewhere: {
      title: "Something brand new?",
      body: "A second project, a different team member asking, anything before an engagement exists: the public contact page reaches the same people.",
      cta: "Go to the contact page",
    },
    viewerNote: "Read-only seat: notes go through an owner or member.",
  },
} as const;
