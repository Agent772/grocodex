# Pantry & Grocery Management TODO

A step-by-step plan for building a modern, user-friendly pantry overview and related features for Grocodex.

---

## 1. Data Model & UX Flow
- [x] Clarify difference between Products (metadata) and Grocery Items (instances)
- [x] Containers can be nested, hold grocery items

---

## 2. Pantry Overview Page
- [ ] Add search bar (searches grocery items, shows product info)
- [ ] List grocery items (name, image, container, quantity, expiration)
- [ ] Filter by container
- [ ] “Add Item” button (opens add workflow)

---

## 3. Add Grocery Item Workflow
- [ ] Barcode scan or product search
- [ ] Product lookup (local DB, then Open Food Facts if not found)
- [ ] Show product details, allow edit
- [ ] Enter grocery item details (quantity, expiration, container)
- [ ] Save item, option to add another (fast workflow)

---

## 4. Product & Grocery Item Logic
- [ ] On add: search for product first (by barcode/name)
- [ ] If product exists: use it
- [ ] If not: create product (from Open Food Facts or manual entry)
- [ ] Then create grocery item linked to product

---

## 5. Container Management
- [ ] List/add/edit/delete containers
- [ ] Support nesting containers
- [ ] Move grocery items between containers

---

## 6. Reusability
- [ ] Product detail component (used in pantry, shopping list, import)
- [ ] Grocery item component (used in all relevant panels)
- [ ] Container selector (used in add/move workflows)

---

## 7. Suggested First Steps
- [ ] Expand PantryOverview: Add search bar, list items, “Add Item” button
- [ ] Create Add Grocery Item Dialog: Barcode scan, product lookup, item details, container select
- [ ] Create reusable ProductDetail and GroceryItem components
- [ ] Implement container management (list, add, select)
- [ ] Wire up fast add workflow (scan, select container, repeat)

---

## 8. User Stories
- [ ] As a user, I want to scan a barcode and quickly add groceries to my pantry, selecting where they go
- [ ] As a user, I want to search my pantry for items and see where they are stored
- [ ] As a user, I want to move items between containers

---

Feel free to add, check off, or expand any item as you build!
