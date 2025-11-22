import { getActionEmoji, formatLogData } from "./loggerMiddleware.utils";
import { Middleware } from "./middleware.types";

const LOG_PREFIX = "[UIBlocking]";

export const loggerMiddleware: Middleware = (context) => {
  const emoji = getActionEmoji(context.action);
  const logData = formatLogData(context);

  console.log(LOG_PREFIX, emoji, context.blockerId, logData);
};
