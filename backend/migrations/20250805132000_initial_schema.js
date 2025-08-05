exports.up = function(knex) {
  return knex.raw(require('fs').readFileSync(__dirname + '/../db/schema.sql', 'utf8'));
};

exports.down = function(knex) {
  // For initial migration, drop all tables (simple destructive rollback)
  return knex.schema
    .dropTableIfExists('shopping_list_item')
    .dropTableIfExists('shopping_list')
    .dropTableIfExists('grocery_item')
    .dropTableIfExists('product')
    .dropTableIfExists('product_category')
    .dropTableIfExists('supermarket_product')
    .dropTableIfExists('supermarket')
    .dropTableIfExists('container')
    .dropTableIfExists('user');
};
