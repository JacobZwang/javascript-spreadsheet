import jwt from "jsonwebtoken";

const config = useRuntimeConfig();

export function createSession(event, user) {
  const token = jwt.sign({ user: { id: user._id } }, config.PRIVATE_KEY, {
    algorithm: "RS256",
  });

  setCookie(event, "js_sheets_session", token, {
    httpOnly: true,
    // secure: true,
    path: "/",
  });
}

export function verifySession(event) {
  const token = getCookie(event, "js_sheets_session");
  if (token) {
    let session;
    try {
      session = jwt.verify(token, config.PRIVATE_KEY, {
        algorithms: ["RS256"],
      });

      return session;
    } catch {
      console.log("could not verify jwt");
      return null;
    }
  } else {
    console.log("no session found");
    return null;
  }
}

export function clearSession(event) {
  setCookie(event, "js_sheets_session", "", {
    httpOnly: true,
    path: "/",
    // secure: true,
  });
}
