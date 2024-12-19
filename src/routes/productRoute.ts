import { IncomingMessage, ServerResponse } from "http";
import {
    createProductHandler,
    getProductsHandler,
    getProductByIdHandler,
    deleteProductHandler,
    updateProductHandler,
} from "../controllers/productController";

export const productRoutes = (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url || req.url === "/") {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: "Invalid request url" }));
        return;
    }

    let routeKey = `${req.method} ${req.url}`;
    const matching = req.url.match(/\api\/products\/([0-9a-fA-F]+)/);

    if (matching) {
        routeKey = `${req.method} /api/products/:id`;
    }

    switch (routeKey) {
        case "POST /api/products":
            createProductHandler(req, res);
            break;
        case "GET /api/products":
            getProductsHandler(req, res);
            break;
        case "GET /api/products/:id":
            getProductByIdHandler(req, res);
            break;
        case "PUT /api/products/:id":
            updateProductHandler(req, res);
            break;
        case "DELETE /api/products/:id":
            deleteProductHandler(req, res);
            break;
        default:
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid request url" }));
    }
};
