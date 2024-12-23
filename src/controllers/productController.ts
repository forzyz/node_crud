import { IncomingMessage, Server, ServerResponse } from "http";
import { IProduct, User } from "../types";
import { generateToken, validateData, validateID } from "../utils";
import { collection, database } from "../db";
import { ObjectId } from "mongodb";
import {
    createProduct,
    createUser,
    deleteProduct,
    getProduct,
    getProductById,
    getProducts,
    getUser,
    updateProduct,
} from "../models/productModel";

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

        let newProduct: IProduct;
        try {
            newProduct = JSON.parse(data);
        } catch (err) {
            console.error("Error while parsing data: ", err);
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid JSON data" }));
        }

        let isProduct;

        try {
            isProduct = await getProduct(newProduct);
        } catch (err) {
            console.error("Error while get product: ", err);
            res.statusCode = 500;
            return res.end(
                JSON.stringify({ message: "Internal server error" })
            );
        }

        if (isProduct) {
            res.statusCode = 400;
            return res.end(
                JSON.stringify({ message: "Product is already exist" })
            );
        }

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
            await createProduct(newProduct);
            res.statusCode = 201;
            res.end(JSON.stringify(newProduct));
        } catch (err) {
            console.error("Error while creating a product: ", err);
            res.statusCode = 500;
            return res.end(
                JSON.stringify({ message: "Internal server error" })
            );
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
            const products = await getProducts();
            res.end(JSON.stringify(products));
        } catch (err) {
            console.error("Error while getting products: ", err);
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
            let objId: ObjectId;

            try {
                objId = ObjectId.createFromHexString(id);
            } catch (err) {
                console.error("Error while creating objectID: ", err);
                res.statusCode = 400;
                return res.end(
                    JSON.stringify({ message: "Invalid product ID format" })
                );
            }

            try {
                const product = await getProductById(objId);

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
                console.error("Error while getting product: ", err);
                res.statusCode = 500;
                return res.end(
                    JSON.stringify({ message: "Internal server error" })
                );
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
    const id = validateID(req);

    if (id) {
        try {
            let objId: ObjectId;

            try {
                objId = ObjectId.createFromHexString(id);
            } catch (err) {
                console.error("Error while creating objectID: ", err);
                res.statusCode = 400;
                return res.end(
                    JSON.stringify({ message: "Invalid product ID format" })
                );
            }

            try {
                const result = await deleteProduct(objId);

                if (result.deletedCount === 0) {
                    res.statusCode = 404;
                    return res.end(
                        JSON.stringify({
                            message: "Product not found to delete",
                        })
                    );
                }
            } catch (err) {
                console.error("Error while deleting a product: ", err);
                res.statusCode = 500;
                return res.end(
                    JSON.stringify({ message: "Internal server error" })
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
    const id = validateID(req);

    if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Invalid product id" }));
    }

    let data = "";

    req.on("data", (chunk: Buffer | string) => {
        data += chunk.toString();
    });

    req.on("end", async () => {
        if (!data) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid request data" }));
        }

        let updatedProduct: IProduct;

        try {
            updatedProduct = JSON.parse(data);
        } catch (err) {
            console.error("Error while parsing data: ", err);
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid JSON data" }));
        }

        const err = validateData(updatedProduct);
        if (err) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: err }));
        }

        try {
            let objId: ObjectId;

            try {
                objId = ObjectId.createFromHexString(id);
            } catch (err) {
                console.error("Error while creating objectID: ", err);
                res.statusCode = 400;
                return res.end(
                    JSON.stringify({ message: "Invalid product ID format" })
                );
            }

            try {
                const result = await updateProduct(objId, updatedProduct);

                if (result.modifiedCount === 0) {
                    res.statusCode = 404;
                    return res.end(
                        JSON.stringify({ message: "No data to modified" })
                    );
                }
            } catch (err) {
                console.error("Error while updating a product: ", err);
                res.statusCode = 500;
                return res.end(
                    JSON.stringify({ message: "Internal server error" })
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

const loginHandler = (req: IncomingMessage, res: ServerResponse) => {
    let data = "";

    req.on("data", (chunk: Buffer | string) => {
        data += chunk.toString();
    });

    req.on("end", async () => {
        let createdUser: User;

        try {
            createdUser = JSON.parse(data);
        } catch (err) {
            console.error("Error while parsing data: ", err);
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid JSON data" }));
        }

        const { name, password } = createdUser;

        if (
            !name ||
            typeof name !== "string" ||
            !password ||
            typeof password !== "string"
        ) {
            res.statusCode = 400;
            return res.end(
                JSON.stringify({ message: "Invalid token data provided" })
            );
        }

        let user;

        try {
            user = await getUser(name, password);
        } catch (err) {
            res.statusCode = 500;
            return res.end(
                JSON.stringify({ message: "Internal server error" })
            );
        }

        if (!user) {
            const result = await createUser(name, password);
            if (result.insertedId) {
                const token = generateToken(result.insertedId);
                res.statusCode = 201;
                return res.end(JSON.stringify(token));
            } else {
                res.statusCode = 500;
                return res.end(
                    JSON.stringify({ message: "Failed to create user" })
                );
            }
        } else {
            const token = generateToken(user._id);
            res.statusCode = 200;
            return res.end(JSON.stringify(token));
        }
    });
};

export {
    createProductHandler,
    getProductsHandler,
    getProductByIdHandler,
    deleteProductHandler,
    updateProductHandler,
    loginHandler,
};
