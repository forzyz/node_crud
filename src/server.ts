import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8000;

type Product = "Vegetable" | "Fruit";

interface IProduct {
    id: number;
    name: string;
    price: number;
    type: Product;
}

const products: IProduct[] = [
    { id: 1, name: "Orange", price: 15, type: "Fruit" },
    { id: 2, name: "Apple", price: 10, type: "Fruit" },
    { id: 3, name: "Avocado", price: 30, type: "Vegetable" },
];

const createProductHandler = (req: IncomingMessage, res: ServerResponse) => {
    let data = "";

    req.on("data", (chunk: Buffer | string) => {
        data += chunk.toString();
    });

    req.on("end", () => {
        if (!data) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid data" }));
        }

        const newProduct: IProduct = JSON.parse(data);

        if (!newProduct) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ message: "User not found!" }));
        } else if (
            typeof newProduct.name !== "string" ||
            typeof newProduct.price !== "number" ||
            !["Vegetable", "Fruit"].includes(newProduct.type)
        ) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid product data" }));
        } else if (
            !newProduct.name ||
            typeof newProduct.name !== "string" ||
            newProduct.name.trim().length === 0
        ) {
            res.statusCode = 400;
            return res.end(
                JSON.stringify({
                    message: "Missing or invalid 'name' field",
                })
            );
        } else if (
            !newProduct.price ||
            typeof newProduct.price !== "number" ||
            newProduct.price <= 0
        ) {
            res.statusCode = 400;
            return res.end(
                JSON.stringify({
                    message: "Missing or invalid 'price' field",
                })
            );
        }

        products.push(newProduct);
        res.statusCode = 200;
        res.end(JSON.stringify(newProduct));
    });
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/api/products" && req.method === "POST") {
        createProductHandler(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
