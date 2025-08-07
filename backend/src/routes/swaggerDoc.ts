/**
 * @openapi
 * /api/grocery-items:
 *   get:
 *     summary: List grocery items
 *     tags: [Grocery Items]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Filter by product id
 *       - in: query
 *         name: container_id
 *         schema:
 *           type: string
 *         description: Filter by container id
 *       - in: query
 *         name: expired
 *         schema:
 *           type: boolean
 *         description: Filter expired items
 *       - in: query
 *         name: expiringSoon
 *         schema:
 *           type: boolean
 *         description: Filter items expiring soon
 *     responses:
 *       200:
 *         description: List of grocery items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroceryItem'
 *   post:
 *     summary: Create grocery item
 *     tags: [Grocery Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroceryItem'
 *     responses:
 *       201:
 *         description: Grocery item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroceryItem'
 *
 * /api/grocery-items/{id}:
 *   get:
 *     summary: Get grocery item by id
 *     tags: [Grocery Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grocery item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroceryItem'
 *   put:
 *     summary: Update grocery item
 *     tags: [Grocery Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroceryItem'
 *     responses:
 *       200:
 *         description: Grocery item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroceryItem'
 *   delete:
 *     summary: Delete grocery item
 *     tags: [Grocery Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Grocery item deleted

 * /api/containers:
 *   get:
 *     summary: List containers
 *     tags: [Containers]
 *     responses:
 *       200:
 *         description: List of containers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Container'
 *   post:
 *     summary: Create container
 *     tags: [Containers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Container'
 *     responses:
 *       201:
 *         description: Container created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Container'

 * /api/containers/{id}:
 *   get:
 *     summary: Get container by id
 *     tags: [Containers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Container'
 *   put:
 *     summary: Update container
 *     tags: [Containers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Container'
 *     responses:
 *       200:
 *         description: Container updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Container'
 *   delete:
 *     summary: Delete container
 *     tags: [Containers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Container deleted

 * /api/stores:
 *   get:
 *     summary: List/search stores
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: List of stores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *   post:
 *     summary: Create store
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       201:
 *         description: Store created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'

 * /api/stores/{id}:
 *   get:
 *     summary: Get store by id
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *   put:
 *     summary: Update store
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       200:
 *         description: Store updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *   delete:
 *     summary: Delete store
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Store deleted

 * /api/store-locations:
 *   get:
 *     summary: List/search store locations
 *     tags: [Store Locations]
 *     responses:
 *       200:
 *         description: List of store locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StoreLocation'
 *   post:
 *     summary: Create store location
 *     tags: [Store Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreLocation'
 *     responses:
 *       201:
 *         description: Store location created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreLocation'

 * /api/store-locations/{id}:
 *   get:
 *     summary: Get store location by id
 *     tags: [Store Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreLocation'
 *   put:
 *     summary: Update store location
 *     tags: [Store Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreLocation'
 *     responses:
 *       200:
 *         description: Store location updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreLocation'
 *   delete:
 *     summary: Delete store location
 *     tags: [Store Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Store location deleted

 * /api/categories:
 *   get:
 *     summary: List/search categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'

 * /api/categories/{id}:
 *   get:
 *     summary: Get category by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted

 * /api/register:
 *   post:
 *     summary: Register user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'

 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string

 * /api/users:
 *   get:
 *     summary: List users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'

 * /api/users/{id}:
 *   put:
 *     summary: Edit user profile
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   delete:
 *     summary: Delete user account
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted

 * /api/users/{id}/password:
 *   put:
 *     summary: Change user password
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPasswordChange'
 *     responses:
 *       200:
 *         description: Password changed

 * /api/shopping-lists:
 *   get:
 *     summary: List shopping lists
 *     tags: [Shopping List]
 *     responses:
 *       200:
 *         description: List of shopping lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShoppingList'
 *   post:
 *     summary: Create shopping list
 *     tags: [Shopping List]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingList'
 *     responses:
 *       201:
 *         description: Shopping list created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShoppingList'

 * /api/shopping-lists/{id}:
 *   get:
 *     summary: Get shopping list by id
 *     tags: [Shopping List]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shopping list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShoppingList'
 *   put:
 *     summary: Update shopping list
 *     tags: [Shopping List]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingList'
 *     responses:
 *       200:
 *         description: Shopping list updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShoppingList'
 *   delete:
 *     summary: Delete shopping list
 *     tags: [Shopping List]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Shopping list deleted

 * /api/shopping-list-items:
 *   get:
 *     summary: List shopping list items
 *     tags: [Shopping List Items]
 *     responses:
 *       200:
 *         description: List of shopping list items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShoppingListItem'
 *   post:
 *     summary: Add item to shopping list
 *     tags: [Shopping List Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingListItem'
 *     responses:
 *       201:
 *         description: Shopping list item added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShoppingListItem'

 * /api/shopping-list-items/{id}:
 *   put:
 *     summary: Update shopping list item
 *     tags: [Shopping List Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingListItem'
 *     responses:
 *       200:
 *         description: Shopping list item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShoppingListItem'
 *   delete:
 *     summary: Remove item from shopping list
 *     tags: [Shopping List Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Shopping list item removed

 * /api/products:
 *   get:
 *     summary: List/search products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'

 * /api/products/{id}:
 *   get:
 *     summary: Get product by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted

 * /api/barcode/{barcode}:
 *   get:
 *     summary: Proxy lookup (Open Food Facts)
 *     tags: [Product/Barcode]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product info from Open Food Facts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'

 * /api/barcode/add:
 *   post:
 *     summary: Add product to inventory by barcode
 *     tags: [Product/Barcode]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               barcode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product added to inventory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'

 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string

 */
// This file is for Swagger JSDoc comments only. Extend as needed for more endpoints.
