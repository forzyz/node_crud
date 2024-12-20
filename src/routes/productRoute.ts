import { IncomingMessage, ServerResponse } from "http";
import {
    createProductHandler,
    getProductsHandler,
    getProductByIdHandler,
    deleteProductHandler,
    updateProductHandler,
    loginHandler,
} from "../controllers/productController";
import { jwtMiddleware } from "../middlewares/jwtMiddleware";

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
    } else if (req.url.includes("/api/login")) {
        routeKey = `${req.url}`;
    }

    switch (routeKey) {
        case "POST /api/products":
            jwtMiddleware(req, res, () => {
                createProductHandler(req, res);
            });
            break;
        case "GET /api/products":
            jwtMiddleware(req, res, () => {
                getProductsHandler(req, res);
            });
            break;
        case "GET /api/products/:id":
            jwtMiddleware(req, res, () => {
                getProductByIdHandler(req, res);
            });
            break;
        case "PUT /api/products/:id":
            jwtMiddleware(req, res, () => {
                updateProductHandler(req, res);
            });
            break;
        case "DELETE /api/products/:id":
            jwtMiddleware(req, res, () => {
                deleteProductHandler(req, res);
            });
            break;
        case "/api/login":
            loginHandler(req, res);
            break;
        default:
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "Invalid request url" }));
    }
};
