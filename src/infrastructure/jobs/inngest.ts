import "server-only";

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "deodar-wears",
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
