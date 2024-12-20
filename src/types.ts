export type Product = "Vegetable" | "Fruit";

export interface IProduct {
    name: string;
    price: number;
    type: Product;
}

export interface User {
    name: string;
    password: string;
}
