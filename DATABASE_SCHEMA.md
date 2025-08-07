# Grocodex Database Schema

## Tables

### user
- id (PK)
- username (unique)
- password_hash
- created_at
- updated_at

### container
- id (PK)
- name
- parent_container_id (nullable, FK container.id)
- description
- photo_url
- ui_color
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

### supermarket
- id (PK)
- name (unique)
- location
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

### supermarket_product
- id (PK)
- product_id (FK product.id)
- supermarket_id (FK supermarket.id)
- location
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

### product_category
- id (PK)
- name (unique)
- description
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

### product
- id (PK)
- name
- brand
- open_food_facts_id
- barcode
- image_url
- category (FK product_category.id)
- nutrition_info (JSON)
- supermarket_location_id (FK supermarket_product.id)
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

### grocery_item
- id (PK)
- product_id (FK product.id)
- container_id (FK container.id)
- name
- unit
- quantity
- rest_quantity
- expiration_date
- buy_date
- is_opened
- opened_date
- photo_url
- notes
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

### shopping_list
- id (PK)
- name
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

### shopping_list_item
- id (PK)
- shopping_list_id (FK shopping_list.id)
- product_id (FK product.id)
- quantity
- unit
- comment
- image_url
- created_at
- created_by_user_id (FK user.id)
- updated_at
- updated_by_user_id (FK user.id)

---
For relationships and more, see the schema.sql file.
