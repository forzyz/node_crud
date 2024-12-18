import { createServer, IncomingMessage, ServerResponse } from "http";
import dotenv from "dotenv"
dotenv.config();

const PORT = process.env.PORT || 8000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Server returns response" }));
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
