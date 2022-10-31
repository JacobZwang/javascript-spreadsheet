import { users } from "../../models";

export default defineEventHandler(async (event) => {
  console.log("GET /api/users");
  console.log(event.context.session);

  try {
    console.log("Find users");
    const usersData = await users.find();
    return usersData.map((user) => ({
      id: user._id,
    }));
  } catch (err) {
    console.dir(err);
    event.res.statusCode = 500;
    return {
      code: "ERROR",
      message: "Something went wrong.",
    };
  }
});
