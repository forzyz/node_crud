export type Product = "Vegetable" | "Fruit";

export interface IProduct {
    id?: number;
    name: string;
    price: number;
    type: Product;
}
