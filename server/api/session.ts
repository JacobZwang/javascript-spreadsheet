import { users } from "../models";
import sheets from "../models/sheets";

export default defineEventHandler(async (event) => {
  console.log("GET /api/session");

  if (!event.context.session) return {};

  const userData = await users.findOne({
    _id: event.context.session.user.id,
  });

  const results = await sheets.find({
    owner: event.context.session.user.id,
  });

  if (!userData) return {};

  return {
    session: {
      user: {
        email: userData.email,
        id: event.context.session.user.id,
      },
      sheets: results ?? [],
    },
  };
});
