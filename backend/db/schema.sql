-- Grocodex SQLite Schema
-- Modular, privacy-first, supports multiple users per household

-- User table: tracks who added/edited items
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Container table: supports nested containers (e.g., Fridge > Shelf > Box)
CREATE TABLE container (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_container_id INTEGER REFERENCES container(id) ON DELETE CASCADE,
    description TEXT,
    photo_url TEXT,
    ui_color TEXT, -- Optional UI color for frontend
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);


-- Supermarket table:
CREATE TABLE supermarket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);

-- Supermarket - product location table
CREATE TABLE supermarket_product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES product(id),
    supermarket_id INTEGER REFERENCES supermarket(id),
    location TEXT, -- e.g., aisle, shelf
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);

-- Product category:
CREATE TABLE product_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);

CREATE TABLE product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    open_food_facts_id TEXT,
    barcode TEXT,
    image_url TEXT,
    category INTEGER REFERENCES product_category(id),
    nutrition_info JSON,
    supermarket_location_id INTEGER REFERENCES supermarket_product(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);

CREATE TABLE grocery_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES product(id),
    container_id INTEGER REFERENCES container(id),
    name TEXT NOT NULL,
    unit TEXT,
    quantity REAL,
    rest_quantity REAL,
    expiration_date DATE,
    buy_date DATE,
    is_opened BOOLEAN DEFAULT 0,
    opened_date DATE,
    photo_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);

-- ShoppingList: one per household, can be extended for multiple lists
CREATE TABLE shopping_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);

CREATE TABLE shopping_list_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopping_list_id INTEGER REFERENCES shopping_list(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id),
    quantity REAL,
    unit TEXT,
    comment TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER REFERENCES user(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id INTEGER REFERENCES user(id)
);

-- Indexes for performance
CREATE INDEX idx_grocery_item_container_id ON grocery_item(container_id);
CREATE INDEX idx_grocery_item_product_id ON grocery_item(product_id);
CREATE INDEX idx_shopping_list_item_product_id ON shopping_list_item(product_id);
CREATE INDEX idx_container_parent_id ON container(parent_container_id);
CREATE INDEX idx_supermarket_product_product_id ON supermarket_product(product_id);
CREATE INDEX idx_supermarket_product_supermarket_id ON supermarket_product(supermarket_id);
CREATE INDEX idx_product_category_name ON product_category(name);
CREATE INDEX idx_product_name ON product(name);
