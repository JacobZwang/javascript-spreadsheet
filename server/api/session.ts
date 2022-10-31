import { users } from "../models";

export default defineEventHandler(async (event) => {
  console.log("GET /api/session");

  if (!event.context.session) return {};

  const userData = await users.findOne({
    _id: event.context.session.user.id,
  });

  if (!userData) return {};

  return {
    session: {
      user: {
        email: userData.email,
      },
    },
  };
});
