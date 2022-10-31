import sheets from "~~/server/models/sheets";
import { Sheet } from "~~/types/sheet";

export default defineEventHandler(async (event) => {
  const sheet = await sheets.findOne({
    _id: event.context.params.sheet,
  });

  if (!sheet) {
    event.res.statusCode = 404;
    return null;
  }

  return sheet;
});
