import { ObjectId } from "mongodb";
import { collection, database } from "../db";
import { IProduct, User } from "../types";

export const createProduct = async (product: IProduct) => {
    try {
        const result = await collection.insertOne(product);
        return result;
    } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product");
    }
};

export const getProducts = async () => {
    try {
        const products = await collection.find({}).toArray();
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
};

export const getProductById = async (id: ObjectId) => {
    try {
        const product = await collection.findOne({ _id: id });
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw new Error("Failed to fetch product");
    }
};

export const deleteProduct = async (id: ObjectId) => {
    try {
        const result = await collection.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new Error("No product found to delete");
        }
        return result;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product");
    }
};

export const updateProduct = async (id: ObjectId, product: IProduct) => {
    try {
        const result = await collection.updateOne(
            { _id: id },
            { $set: product }
        );
        if (result.modifiedCount === 0) {
            throw new Error("No data modified");
        }
        return result;
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Failed to update product");
    }
};

export const createUser = async (username: string, pwd: string) => {
    const collection = database.collection<User>("users");
    try {
        const result = await collection.insertOne({ name: username, password: pwd });
        return result;
    } catch (err) {
        console.error("Error while inserting user");
        throw new Error("Failed to create user");
    }
};

export const getUser = async (username: string, pwd: string) => {
    const collection = database.collection<User>("users");
    try {
        const user = await collection.findOne({name: username, password: pwd});
        if (!user) {
            return null;
        }

        return user;
    } catch (err) {
        console.error("Error while getting user");
        throw new Error("Failed to get user");
    }
}