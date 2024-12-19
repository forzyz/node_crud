import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import dotenv from "dotenv";
import { productRoutes } from "./routes/productRoute";
import { logger } from "./middlewares/logger";
import { jsonMiddleware } from "./middlewares/jsonMiddleware";
dotenv.config();

const PORT = process.env.PORT || 8000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    logger(req, res, () => {
        jsonMiddleware(req, res, () => {
            productRoutes(req, res);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
