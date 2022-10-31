import { clearSession } from "~~/server/utils/sessions";

export default defineEventHandler(async (event) => {
  console.log("GET /api/logout");
  clearSession(event);

  return {};
});
