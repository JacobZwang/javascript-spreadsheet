import { users } from "../models";
import { createSession } from "~~/server/utils/sessions";

interface IRequestBody {
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  console.log("POST /api/signup");
  const { email, password } = await useBody<IRequestBody>(event);
  try {
    const userData = await users.findOne({
      email,
    });
    if (userData) {
      console.log(`User with email ${email} already exists`);
      event.res.statusCode = 409;
      return {
        code: "USER_EXISTS",
        message: "User with given email already exists.",
      };
    } else {
      console.log("Create user");
      const newUserData = await users.create({
        email,
        password,
      });

      // set session cookie
      createSession(event, newUserData);

      return {
        id: newUserData._id,
      };
    }
  } catch (err) {
    console.dir(err);
    event.res.statusCode = 500;
    return {
      code: "ERROR",
      message: "Something wrong.",
    };
  }
});
