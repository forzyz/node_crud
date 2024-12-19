import { IncomingMessage, ServerResponse } from "http";
import fs from "fs/promises"

export const logger = (
    req: IncomingMessage,
    _res: ServerResponse,
    next: () => void
) => {
    const logToFile = async () => {
        try {
            await fs.appendFile("./log.txt", `${req.url} ${req.method}\n`);
        } catch (err) {
            console.error("Error while logging request: ", err);
        }
    };
    logToFile().then(() => next());
};
