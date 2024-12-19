import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { IProduct } from "./types";

dotenv.config();

const uri = process.env.DB_URI;

if (!uri) {
    console.error("Invalid uri... Exiting the process...");
    process.exit(1);
}

const client = new MongoClient(uri);
const database = client.db("products_db");
const collection = database.collection<IProduct>("products");

process.on("SIGINT", async () => {
    try {
        await client.close();
        console.log("MongoDB connection closed");
    } catch (err) {
        console.error("Error while closing MongoDB connection");
    } finally {
        process.exit(0);
    }
});

export { database, collection, client };
