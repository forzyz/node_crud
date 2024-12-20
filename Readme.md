
# Product Management API in PURE Node.js

This is a server-side API that allows managing products in a database. The API supports basic CRUD operations (create, read, update, and delete products) and provides user authentication via tokens.

## Functionality

### Main Features:
- **Create Product**: Adds a new product to the database.
- **Get All Products**: Returns a list of all products from the database.
- **Get Product by ID**: Returns a product by its ID.
- **Update Product**: Updates an existing product.
- **Delete Product**: Deletes a product by ID.
- **User Login**: Allows a user to log in using their username and password. If the user does not exist, they will be created.

## Technologies

- Node.js
- TypeScript
- MongoDB (via MongoDB driver)
- HTTP module for handling requests
- JSON Web Token (JWT) for authentication

## Project Structure

- **src/handlers**: contains request handlers for CRUD operations.
- **src/models**: contains models for interacting with products and users.
- **src/utils**: utility functions for data validation and token generation.
- **src/db**: database connection configuration.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo-name/product-management-api.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the MongoDB connection in `src/db.ts`.

4. To start the server, use the command:
   ```bash
   npm start
   ```

   The server runs by default on port 3000.

## Endpoints

### 1. **Create Product**

**POST /products**

Endpoint to add a new product.

**Request Body**:
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 19.99
}
```

**Response**:
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 19.99,
  "_id": "product-id"
}
```

### 2. **Get All Products**

**GET /products**

Gets the list of all products.

**Response**:
```json
[
  {
    "_id": "product-id",
    "name": "Product Name",
    "description": "Product Description",
    "price": 19.99
  },
  ...
]
```

### 3. **Get Product by ID**

**GET /products/{id}**

Gets a product by its ID.

**Request Example**:
```
GET /products/615c2e9a9f4e1c1c4f8b4567
```

**Response**:
```json
{
  "_id": "615c2e9a9f4e1c1c4f8b4567",
  "name": "Product Name",
  "description": "Product Description",
  "price": 19.99
}
```

### 4. **Update Product**

**PUT /products/{id}**

Updates a product by its ID.

**Request Body**:
```json
{
  "name": "Updated Product Name",
  "description": "Updated Product Description",
  "price": 29.99
}
```

**Response**:
```json
{
  "name": "Updated Product Name",
  "description": "Updated Product Description",
  "price": 29.99
}
```

### 5. **Delete Product**

**DELETE /products/{id}**

Deletes a product by its ID.

**Response**:
```json
{
  "message": "Product deleted successfully"
}
```

### 6. **User Login**

**POST /login**

Allows a user to log in using their username and password. If the user does not exist, they will be created.

**Request Body**:
```json
{
  "name": "username",
  "password": "password"
}
```

**Response**:
```json
{
  "token": "generated-jwt-token"
}
```

## MongoDB Setup

Set up the MongoDB connection in `src/db.ts`. You need to either set up a MongoDB server or use a service and provide the correct connection URL.