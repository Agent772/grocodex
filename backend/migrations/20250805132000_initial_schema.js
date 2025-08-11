exports.up = function(knex) {
return knex.schema
  // User table
  .createTable('user', table => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('password_hash').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  })
  // Container table
  .createTable('container', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('parent_container_id').references('id').inTable('container').onDelete('CASCADE');
    table.string('description');
    table.string('photo_url');
    table.string('ui_color');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Supermarket table
  .createTable('supermarket', table => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('location');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Supermarket_product table
  .createTable('supermarket_product', table => {
    table.increments('id').primary();
    table.integer('product_id').references('id').inTable('product');
    table.integer('supermarket_id').references('id').inTable('supermarket');
    table.string('location');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Product category
  .createTable('product_category', table => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('description');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Product table
  .createTable('product', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('brand');
    table.string('open_food_facts_id');
    table.string('barcode');
    table.string('image_url');
    table.integer('category').references('id').inTable('product_category');
    table.json('nutrition_info');
    table.integer('supermarket_location_id').references('id').inTable('supermarket_product');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Grocery item table
  .createTable('grocery_item', table => {
    table.increments('id').primary();
    table.integer('product_id').references('id').inTable('product');
    table.integer('container_id').references('id').inTable('container');
    table.string('name').notNullable();
    table.string('unit');
    table.float('quantity');
    table.float('rest_quantity');
    table.date('expiration_date');
    table.date('buy_date');
    table.boolean('is_opened').defaultTo(false);
    table.date('opened_date');
    table.string('photo_url');
    table.string('notes');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Shopping list
  .createTable('shopping_list', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Shopping list item
  .createTable('shopping_list_item', table => {
    table.increments('id').primary();
    table.integer('shopping_list_id').references('id').inTable('shopping_list').onDelete('CASCADE');
    table.integer('product_id').references('id').inTable('product');
    table.float('quantity');
    table.string('unit');
    table.string('comment');
    table.string('image_url');
    table.integer('completed').defaultTo(0);
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.integer('created_by_user_id').references('id').inTable('user');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.integer('updated_by_user_id').references('id').inTable('user');
  })
  // Indexes
  .raw('CREATE INDEX idx_grocery_item_container_id ON grocery_item(container_id)')
  .raw('CREATE INDEX idx_grocery_item_product_id ON grocery_item(product_id)')
  .raw('CREATE INDEX idx_shopping_list_item_product_id ON shopping_list_item(product_id)')
  .raw('CREATE INDEX idx_container_parent_id ON container(parent_container_id)')
  .raw('CREATE INDEX idx_supermarket_product_product_id ON supermarket_product(product_id)')
  .raw('CREATE INDEX idx_supermarket_product_supermarket_id ON supermarket_product(supermarket_id)')
  .raw('CREATE INDEX idx_product_category_name ON product_category(name)')
  .raw('CREATE INDEX idx_product_name ON product(name)');
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('shopping_list_item')
    .dropTableIfExists('product')
    .dropTableIfExists('shopping_list')
    .dropTableIfExists('product_category')
    .dropTableIfExists('supermarket_product')
    .dropTableIfExists('supermarket')
    .dropTableIfExists('container')
    .dropTableIfExists('user');
};
