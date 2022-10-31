import sheets from "~~/server/models/sheets";
import { createDefaultSheet } from "~~/server/utils/sheet";

export default defineEventHandler(async (event) => {
  const results = await sheets.find({
    owner: event.context.session.user.id,
  });

  return results;
});
