import { IncomingMessage } from "http";
import { IProduct } from "./types";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const SECRET_KEY = process.env.JWT_SECRET || "S9CNehXuJLPVjmsWr6AQB2";

export const validateData = (product: IProduct): string | undefined => {
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

export const validateID = (req: IncomingMessage): string | undefined => {
    if (req.url) {
        return req.url.split("/")[3];
    }
};

export const generateToken = (userId: ObjectId): string => {
    const payload = { id: userId };
    const opts = { expiresIn: "1h" };
    return jwt.sign(payload, SECRET_KEY, opts);
};
