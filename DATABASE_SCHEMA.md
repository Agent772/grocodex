# Grocodex Database Schema

## Tables

### container
- id (PK)
- name
- parent_container_id (nullable, FK container.id)
- description
- photo_url
- ui_color
- created_at
- updated_at

### supermarket
- id (PK)
- name (unique)
- adress
- created_at
- updated_at

### supermarket_product
- id (PK)
- product_id (FK product.id)
- supermarket_id (FK supermarket.id)
- in_store_location
- created_at
- updated_at

### product_group
- id (PK)
- name
- brand (optional)

### product
- id (PK)
- product_group_id (FK product_group.id)
- name
- brand
- barcode
- unit
- quantity
- image_url
- supermarket_location_id (FK supermarket_product.id)
- created_at
- updated_at

### grocery_item
- id (PK)
- product_id (FK product.id)
- container_id (FK container.id)
- rest_quantity
- expiration_date
- buy_date
- is_opened
- opened_date
- notes
- created_at
- updated_at

### shopping_list
- id (PK)
- name
- created_at
- updated_at

### shopping_list_item
- id (PK)
- shopping_list_id (FK shopping_list.id)
- product_id (FK product.id)
- quantity
- comment
- image_url
- created_at
- updated_at

