export const DEMO_STEPS = [
  {
    number: "01",
    opensSecondTab: false,
    title: "Protect unsaved changes",
    instruction:
      "Edit the shipping address in Checkout, then choose another page in the navigation.",
    outcome: "A confirmation lets you stay and save or leave anyway.",
  },
  {
    number: "02",
    opensSecondTab: false,
    title: "Watch an action in progress",
    instruction: "Save your cart, then place an order. Watch the live inspector while it runs.",
    outcome: "Affected actions pause until the operation completes.",
  },
  {
    number: "03",
    opensSecondTab: true,
    title: "Compare isolated sessions",
    instruction: "Open a second demo tab. Activate a risk hold in one tab and compare the other.",
    outcome: "Each tab owns its blockers, queries, and audit events.",
  },
  {
    number: "04",
    opensSecondTab: false,
    title: "Recover from a slow payment",
    instruction: "Enable Slow gateway, place an order, then cancel the pending operation.",
    outcome: "Turn off Slow gateway and retry. Cancellation releases the pending action.",
  },
  {
    number: "05",
    opensSecondTab: false,
    title: "Follow autosave protection",
    instruction:
      "Enable Autosave checkout, edit the shipping address and open package Devtools using the shield button.",
    outcome:
      "Active Blockers shows unsaved navigation protection, followed by the guarded save and scope release.",
  },
  {
    number: "06",
    opensSecondTab: false,
    title: "Coordinate a user and an agent",
    instruction:
      "In Checkout, start an agent edit in User and agent coordination. Try manual controls and Help and chat, then complete or fail the operation.",
    outcome:
      "Property, revision and recalculation stay protected together; unrelated help remains available and settlement releases the scopes.",
  },
];
