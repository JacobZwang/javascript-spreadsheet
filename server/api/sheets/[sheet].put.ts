import sheets from "~~/server/models/sheets";

export default defineEventHandler(async (event) => {
  try {
    const sheet = await sheets.findOne({
      _id: event.context.params.sheet,
    });
    const updatedSheet = await useBody(event);

    if (sheet.owner !== event.context.session.user.id) {
      event.res.statusCode = 401;
      return {
        message: "you are not allowed to edit this document",
      };
    }

    await sheet.update({
      ...updatedSheet,
      owner: event.context.session.user.id,
    });
  } catch {
    event.res.statusCode = 500;
    return {
      message: "Failed to saved sheet",
    };
  }

  event.res.statusCode = 201;
  return {
    message: "Successfully saved sheet",
  };
});
