import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import dotenv from "dotenv";
import fs from "fs/promises";
import { collection } from "./db";
import { IProduct } from "./types";
import { ObjectId } from "mongodb";
dotenv.config();

const PORT = process.env.PORT || 8000;

const logger = (
    req: IncomingMessage,
    res: ServerResponse,
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

const jsonMiddleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
) => {
    res.setHeader("Content-Type", "application/json");
    next();
};

const validateData = (product: IProduct): string | undefined => {
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

const validateID = (req: IncomingMessage): string | undefined => {
    if (req.url) {
        return req.url.split("/")[3];
    }
};

const createProductHandler = (req: IncomingMessage, res: ServerResponse) => {
    let data = "";

    req.on("data", (chunk: Buffer | string) => {
        data += chunk.toString();
    });

    req.on("end", async () => {
        if (!data) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid request data" }));
        }

        const newProduct: IProduct = JSON.parse(data);
        if (!newProduct) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ message: "User not found!" }));
        }

        const err = validateData(newProduct);
        if (err) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: err }));
        }

        try {
            await collection.insertOne(newProduct);

            res.statusCode = 201;
            res.end(JSON.stringify(newProduct));
        } catch (err) {
            console.error(err);
        }
    });
};

const getProductsHandler = async (
    req: IncomingMessage,
    res: ServerResponse
) => {
    if (collection) {
        try {
            res.statusCode = 200;
            const products = await collection.find({}).toArray();
            res.end(JSON.stringify(products));
        } catch (err) {
            console.error(err);
            res.statusCode = 404;
            return res.end(
                JSON.stringify({ message: "Error while finding products" })
            );
        }
    } else {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: "Products not found" }));
    }
};

const getProductByIdHandler = async (
    req: IncomingMessage,
    res: ServerResponse
) => {
    const id = validateID(req);

    if (id) {
        try {
            const objId = ObjectId.createFromHexString(id);
            const product = await collection.findOne(objId);

            if (!product) {
                res.statusCode = 404;
                return res.end(
                    JSON.stringify({ message: "Product not found" })
                );
            } else {
                res.statusCode = 200;
                return res.end(JSON.stringify(product));
            }
        } catch (err) {
            console.error("Error while finding product: ", err);
            res.statusCode = 500;
            return res.end(
                JSON.stringify({ message: "Internal server error" })
            );
        }
    } else {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Invalid product id" }));
    }
};

const deleteProductHandler = async (
    req: IncomingMessage,
    res: ServerResponse
) => {
    const id = req.url?.split("/")[3];

    if (id) {
        try {
            const objId = ObjectId.createFromHexString(id);

            const result = await collection.deleteOne({ _id: objId });

            if (result.deletedCount === 0) {
                res.statusCode = 404;
                return res.end(
                    JSON.stringify({ message: "Product not found to delete" })
                );
            }
        } catch (err) {
            console.error("Error while deleting a product");
            res.statusCode = 500;
            return res.end(
                JSON.stringify({ message: "Internal server error" })
            );
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Product deleted successfully" }));
    } else {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Invalid product ID" }));
    }
};

const updateProductHandler = (req: IncomingMessage, res: ServerResponse) => {
    const id = req.url?.split("/")[3];

    if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Invalid product id" }));
    }

    let data = "";

    req.on("data", (chunk: Buffer | string) => {
        data += chunk;
    });

    req.on("end", async () => {
        if (!data) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid request data" }));
        }

        let updatedProduct = JSON.parse(data);

        const err = validateData(updatedProduct);

        if (err) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: err }));
        }

        try {
            const objId = ObjectId.createFromHexString(id);

            const result = await collection.updateOne(
                { _id: objId },
                { $set: updatedProduct }
            );

            if (result.modifiedCount === 0) {
                res.statusCode = 404;
                return res.end(
                    JSON.stringify({ message: "No data to modified" })
                );
            }

            res.statusCode = 200;
            return res.end(JSON.stringify(updatedProduct));
        } catch (err) {
            console.error("Error while updating data:", err);
            res.statusCode = 500;
            return res.end(
                JSON.stringify({ message: "Internal server error" })
            );
        }
    });
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    logger(req, res, () => {
        jsonMiddleware(req, res, () => {
            if (!req.url || req.url === "/") {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: "Invalid request url" }));
                return;
            }

            if (req.url === "/api/products" && req.method === "POST") {
                createProductHandler(req, res);
            } else if (req.url === "/api/products" && req.method === "GET") {
                getProductsHandler(req, res);
            } else if (
                req.url.match(/\api\/products\/([0-9a-fA-F]+)/) &&
                req.method === "GET"
            ) {
                getProductByIdHandler(req, res);
            } else if (
                req.url.match(/\api\/products\/([0-9a-fA-F]+)/) &&
                req.method === "DELETE"
            ) {
                deleteProductHandler(req, res);
            } else if (
                req.url.match(/\api\/products\/([0-9a-fA-F]+)/) &&
                req.method === "PUT"
            ) {
                updateProductHandler(req, res);
            } else {
                res.statusCode = 400;
                return res.end(
                    JSON.stringify({ message: "Invalid request url" })
                );
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
