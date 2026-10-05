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
];
