import { verifySession } from "../utils/sessions";

export default defineEventHandler((event) => {
  event.context.session = verifySession(event);
});
