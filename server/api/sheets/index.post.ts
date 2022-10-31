import sheets from "~~/server/models/sheets";
import { createDefaultSheet } from "~~/server/utils/sheet";

export default defineEventHandler(async (event) => {
  const sheet = await sheets.create({
    ...createDefaultSheet(),
    owner: event.context.session.user.id,
  });

  return {
    ...sheet,
    id: sheet._id,
  };
});
