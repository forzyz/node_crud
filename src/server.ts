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

const validate = (product: IProduct): string | undefined => {
    if (
        typeof product.name !== "string" ||
        typeof product.price !== "number" ||
        !["Vegetable", "Fruit"].includes(product.type)
    ) {
        return "Invalid product data";
    } else if (
        !product.name ||
        typeof product.name !== "string" ||
        product.name.trim().length === 0
    ) {
        return "Missing or invalid 'name' field";
    } else if (
        !product.price ||
        typeof product.price !== "number" ||
        product.price <= 0
    ) {
        return "Missing or invalid 'price' field";
    }
};

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
        }

        const err = validate(newProduct);
        if (err) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: err }));
        }

        products.push(newProduct);
        res.statusCode = 200;
        res.end(JSON.stringify(newProduct));
    });
};

const getProductsHandler = (req: IncomingMessage, res: ServerResponse) => {
    if (products) {
        res.statusCode = 200;
        res.end(JSON.stringify(products));
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: "Products not found" }));
    }
};

const getProductByIdHandler = (req: IncomingMessage, res: ServerResponse) => {
    const id = req.url?.split("/")[3];

    if (id) {
        const product = products.find((item) => item.id === parseInt(id));

        if (!product) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Product not found" }));
        } else {
            res.statusCode = 200;
            res.end(JSON.stringify(product));
        }
    } else {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: "Invalid product id" }));
    }
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Content-Type", "application/json");

    if (!req.url || req.url === "/") {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: "Invalid request url" }));
        return;
    }

    if (req.url === "/api/products" && req.method === "POST") {
        createProductHandler(req, res);
    } else if (req.url === "/api/products" && req.method === "GET") {
        getProductsHandler(req, res);
    } else if (req.url.match(/\api\/products\/([0-9a-fA-F]+)/)) {
        getProductByIdHandler(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
