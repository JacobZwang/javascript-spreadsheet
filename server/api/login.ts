import { users } from "../models";
import { createSession } from "~~/server/utils/sessions";

interface IRequestBody {
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  console.log("POST /api/login");
  const { email, password } = await useBody<IRequestBody>(event);

  // Check if email is passed.
  if (!email) {
    event.res.statusCode = 400;
    return {
      code: "EMAIL_REQUIRED",
      message: "Email is required.",
    };
  }

  // Check if password is passed.
  if (!password) {
    event.res.statusCode = 400;
    return {
      code: "PASSWORD_REQUIRED",
      message: "Password is required.",
    };
  }

  try {
    console.log("Find user");
    const userData = await users.findOne({
      email: email.toLowerCase(),
    });
    if (userData) {
      console.log("User found");
      //@ts-expect-error: mongoose-bcrypt isn't properly typed
      const isPasswordValid = await userData.verifyPasswordSync(password);
      if (isPasswordValid) {
        // set session cookie
        createSession(event, userData);

        return {
          id: userData._id,
        };
      } else {
        console.log("Password is not valid");
        event.res.statusCode = 404;
        return {
          code: "USER_NOT_FOUND",
          message: "Email or password is incorrect.",
        };
      }
    } else {
      console.log("User not found");
      event.res.statusCode = 404;
      return {
        code: "USER_NOT_FOUND",
        message: "Email or password is incorrect.",
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
