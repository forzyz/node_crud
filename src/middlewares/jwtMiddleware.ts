import jwt from "jsonwebtoken";
import { IncomingMessage, ServerResponse } from "http";

const SECRET_KEY = process.env.JWT_SECRET || "S9CNehXuJLPVjmsWr6AQB2";

export const jwtMiddleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
) => {
    const authHeader = req.headers["authorization"];

    const token =
        typeof authHeader === "string" ? authHeader.split(" ")[1] : undefined;

    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ message: "Token not provided" }));
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.statusCode = 403;
        return res.end(JSON.stringify({ message: "Invalid or expired token" }));
    }
};
