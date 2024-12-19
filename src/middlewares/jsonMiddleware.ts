import { IncomingMessage, ServerResponse } from "http";

export const jsonMiddleware = (
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
) => {
    res.setHeader("Content-Type", "application/json");
    next();
};
