const express = require('express');
const router = express.Router();
const x3plController = require('../controllers/x3plController');

/**
 * @swagger
 * /x3pl/add:
 *   post:
 *     summary: Add new record to X_Three_PL table
 *     description: Creates a new record in X_Three_PL table with warehouse name lookup from x_Storage_Scklads
 *     tags:
 *       - X_Three_PL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/X3PLAddRequest'
 *     responses:
 *       200:
 *         description: Record added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               errorCode: 0
 *               value: {}
 *       400:
 *         description: Bad request - validation error or warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Validation failed: shk is required and must be a non-empty string"
 *               warehouseNotFound:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Warehouse with SHK '123' not found in x_Storage_Scklads"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.post('/add', x3plController.addRecord);

/**
 * @swagger
 * /x3pl/add-minimal:
 *   post:
 *     summary: Add minimal record to X_Three_PL table
 *     description: Creates a new record in X_Three_PL table with only shk and name. Date is automatically set to current datetime, other fields are set to default values.
 *     tags:
 *       - X_Three_PL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shk
 *               - name
 *             properties:
 *               shk:
 *                 type: string
 *                 description: Product barcode
 *                 example: "1234567890"
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "Новый товар"
 *           example:
 *             shk: "1234567890"
 *             name: "Новый товар"
 *     responses:
 *       200:
 *         description: Minimal record added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 errorCode:
 *                   type: integer
 *                   example: 0
 *                 value:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Generated record ID
 *                       example: 1
 *                     shk:
 *                       type: string
 *                       description: Product barcode
 *                       example: "1234567890"
 *                     name:
 *                       type: string
 *                       description: Product name
 *                       example: "Новый товар"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: Automatically set creation date
 *                       example: "2024-01-15T10:30:00.000Z"
 *             example:
 *               success: true
 *               errorCode: 0
 *               value:
 *                 id: 1
 *                 shk: "1234567890"
 *                 name: "Новый товар"
 *                 date: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Validation failed: shk is required and must be a non-empty string"
 *               missingName:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Validation failed: name is required and must be a non-empty string"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.post('/add-minimal', x3plController.addMinimalRecord);

/**
 * @swagger
 * /x3pl/update:
 *   put:
 *     summary: Update record with warehouse barcode and quantity
 *     description: Updates an existing record in X_Three_PL table with wr_shk and kolvo. Automatically sets date_upd to current datetime and retrieves warehouse name from x_Storage_Scklads.
 *     tags:
 *       - X_Three_PL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - wr_shk
 *               - kolvo
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Record ID to update
 *                 example: 1
 *               wr_shk:
 *                 type: string
 *                 description: Warehouse barcode
 *                 example: "CELL001"
 *               kolvo:
 *                 type: integer
 *                 minimum: 0
 *                 description: Quantity
 *                 example: 10
 *           example:
 *             id: 1
 *             wr_shk: "CELL001"
 *             kolvo: 10
 *     responses:
 *       200:
 *         description: Record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 errorCode:
 *                   type: integer
 *                   example: 0
 *                 value:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Updated record ID
 *                       example: 1
 *                     wr_shk:
 *                       type: string
 *                       description: Warehouse barcode
 *                       example: "CELL001"
 *                     wr_name:
 *                       type: string
 *                       description: Warehouse name retrieved from x_Storage_Scklads
 *                       example: "Склад А - Ячейка 001"
 *                     kolvo:
 *                       type: integer
 *                       description: Updated quantity
 *                       example: 10
 *                     date_upd:
 *                       type: string
 *                       format: date-time
 *                       description: Update timestamp
 *                       example: "2024-01-15T14:30:00.000Z"
 *             example:
 *               success: true
 *               errorCode: 0
 *               value:
 *                 id: 1
 *                 wr_shk: "CELL001"
 *                 wr_name: "Склад А - Ячейка 001"
 *                 kolvo: 10
 *                 date_upd: "2024-01-15T14:30:00.000Z"
 *       400:
 *         description: Bad request - validation error, record not found, or warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Validation failed: id is required and must be a positive number"
 *               recordNotFound:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Record with ID 999 not found"
 *               warehouseNotFound:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Warehouse with SHK 'INVALID' not found in x_Storage_Scklads"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.put('/update', x3plController.updateRecord);

/**
 * @swagger
 * /x3pl/razmeshennye:
 *   get:
 *     summary: Get all placed items from X_Three_PL table
 *     description: Returns all records where kolvo > 0 and both wr_shk and wr_name are not empty
 *     tags:
 *       - X_Three_PL
 *     responses:
 *       200:
 *         description: Successfully retrieved placed items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemsResponse'
 *             example:
 *               success: true
 *               errorCode: 0
 *               value:
 *                 items:
 *                   - shk: "1234567890"
 *                     name: "Product Name"
 *                     wr_shk: "0987654321"
 *                     wr_name: "Warehouse A"
 *                     kolvo: 10
 *                     condition: "Good"
 *                     reason: "Return from customer"
 *                   - shk: "1111111111"
 *                     name: "Another Product"
 *                     wr_shk: "2222222222"
 *                     wr_name: "Warehouse B"
 *                     kolvo: 5
 *                     condition: "Excellent"
 *                     reason: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.get('/razmeshennye', x3plController.getRazmeshennye);

/**
 * @swagger
 * /x3pl/nerazmeshennye:
 *   get:
 *     summary: Get all unplaced items from X_Three_PL table
 *     description: Returns all records where kolvo = 0 and both wr_shk and wr_name are empty or null
 *     tags:
 *       - X_Three_PL
 *     responses:
 *       200:
 *         description: Successfully retrieved unplaced items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemsResponse'
 *             example:
 *               success: true
 *               errorCode: 0
 *               value:
 *                 items:
 *                   - shk: "9876543210"
 *                     name: "Unplaced Product"
 *                     wr_shk: ""
 *                     wr_name: ""
 *                     kolvo: 0
 *                     condition: "Pending"
 *                     reason: "Awaiting placement"
 *                   - shk: "5555555555"
 *                     name: "Another Unplaced Product"
 *                     wr_shk: null
 *                     wr_name: null
 *                     kolvo: 0
 *                     condition: "New"
 *                     reason: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.get('/nerazmeshennye', x3plController.getNerazmeshennye);

/**
 * @swagger
 * /x3pl/snyatie:
 *   post:
 *     summary: Remove items from storage cell
 *     description: Removes specified quantity of items from storage. If quantity matches record quantity, the record is deleted. Otherwise, the quantity is reduced and date_upd is updated.
 *     tags:
 *       - X_Three_PL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/X3PLSnyatieRequest'
 *     responses:
 *       200:
 *         description: Items successfully removed from storage
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               errorCode: 0
 *               value: {}
 *       400:
 *         description: Bad request - validation error or insufficient quantity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Validation failed: shk is required and must be a non-empty string"
 *               insufficientQuantity:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Недостаточное количество или запись не найдена"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.post('/snyatie', x3plController.removeItems);

/**
 * @swagger
 * /x3pl/search:
 *   get:
 *     summary: Search records by warehouse barcode (wr_shk)
 *     description: Returns all records that match the specified warehouse barcode
 *     tags:
 *       - X_Three_PL
 *     parameters:
 *       - in: query
 *         name: wr_shk
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse barcode to search for
 *         example: "CELL001"
 *     responses:
 *       200:
 *         description: Successfully found records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemsResponse'
 *             example:
 *               success: true
 *               errorCode: 0
 *               value:
 *                 items:
 *                   - shk: "1234567890"
 *                     name: "Product Name"
 *                     wr_shk: "CELL001"
 *                     wr_name: "Warehouse A - Cell 001"
 *                     kolvo: 10
 *                     condition: "Good"
 *                     reason: "Storage"
 *                   - shk: "9876543210"
 *                     name: "Another Product"
 *                     wr_shk: "CELL001"
 *                     wr_name: "Warehouse A - Cell 001"
 *                     kolvo: 5
 *                     condition: "Excellent"
 *                     reason: null
 *       400:
 *         description: Bad request - missing wr_shk parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 400
 *               value:
 *                 error: "Параметр wr_shk обязателен"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.get('/search', x3plController.searchByWrShk);

/**
 * @swagger
 * /x3pl/search-like:
 *   get:
 *     summary: Search records with LIKE by multiple fields
 *     description: Returns all records that match any of the specified search parameters using LIKE operator. At least one search parameter must be provided.
 *     tags:
 *       - X_Three_PL
 *     parameters:
 *       - in: query
 *         name: wr_name
 *         required: false
 *         schema:
 *           type: string
 *         description: Warehouse name to search for (partial match)
 *         example: "Склад"
 *       - in: query
 *         name: wr_shk
 *         required: false
 *         schema:
 *           type: string
 *         description: Warehouse barcode to search for (partial match)
 *         example: "CELL"
 *       - in: query
 *         name: shk
 *         required: false
 *         schema:
 *           type: string
 *         description: Product barcode to search for (partial match)
 *         example: "1234"
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Product name to search for (partial match)
 *         example: "Товар"
 *     responses:
 *       200:
 *         description: Successfully found records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemsResponse'
 *             example:
 *               success: true
 *               errorCode: 0
 *               value:
 *                 items:
 *                   - shk: "1234567890"
 *                     name: "Товар 1"
 *                     wr_shk: "CELL001"
 *                     wr_name: "Склад А - Ячейка 001"
 *                     kolvo: 10
 *                     condition: "Good"
 *                     reason: "Storage"
 *                   - shk: "1234999999"
 *                     name: "Другой товар"
 *                     wr_shk: "CELL002"
 *                     wr_name: "Склад Б - Ячейка 002"
 *                     kolvo: 5
 *                     condition: "Excellent"
 *                     reason: null
 *       400:
 *         description: Bad request - no search parameters provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 400
 *               value:
 *                 error: "Необходимо указать хотя бы один параметр поиска (wr_name, wr_shk, shk, name)"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.get('/search-like', x3plController.searchWithLike);

/**
 * @swagger
 * /x3pl/inventory:
 *   post:
 *     summary: Perform inventory operation
 *     description: Updates or deletes a record based on inventory data. If kolvo is 0, the record is deleted. Otherwise, the record is updated with new values.
 *     tags:
 *       - X_Three_PL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/X3PLInventoryRequest'
 *     responses:
 *       200:
 *         description: Inventory operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               errorCode: 0
 *               value: {}
 *       400:
 *         description: Bad request - validation error or record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Validation failed: shk is required and must be a non-empty string"
 *               recordNotFound:
 *                 value:
 *                   success: false
 *                   errorCode: 400
 *                   value:
 *                     error: "Запись не найдена"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.post('/inventory', x3plController.performInventory);

/**
 * @swagger
 * /x3pl/all:
 *   get:
 *     summary: Get all records from X_Three_PL table with all fields
 *     description: Returns all records from X_Three_PL table with complete data including id, dates, and executor information. Supports pagination for large datasets.
 *     tags:
 *       - X_Three_PL
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10000
 *           default: 1000
 *         description: Maximum number of records to return (max 10000)
 *         example: 100
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of records to skip for pagination
 *         example: 0
 *     responses:
 *       200:
 *         description: Successfully retrieved records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 errorCode:
 *                   type: integer
 *                   example: 0
 *                 value:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Record ID
 *                             example: 1
 *                           shk:
 *                             type: string
 *                             description: Product barcode
 *                             example: "1234567890"
 *                           name:
 *                             type: string
 *                             description: Product name
 *                             example: "Товар 1"
 *                           wr_shk:
 *                             type: string
 *                             description: Warehouse barcode
 *                             example: "CELL001"
 *                           wr_name:
 *                             type: string
 *                             description: Warehouse name
 *                             example: "Склад А - Ячейка 001"
 *                           kolvo:
 *                             type: integer
 *                             description: Quantity
 *                             example: 10
 *                           condition:
 *                             type: string
 *                             description: Product condition
 *                             example: "Good"
 *                           reason:
 *                             type: string
 *                             nullable: true
 *                             description: Reason for storage
 *                             example: "Storage"
 *                           ispolnitel:
 *                             type: string
 *                             description: Executor name
 *                             example: "Иванов И.И."
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             description: Creation date
 *                             example: "2024-01-15T10:30:00.000Z"
 *                           date_upd:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             description: Last update date
 *                             example: "2024-01-16T14:20:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of records in table
 *                           example: 1500
 *                         limit:
 *                           type: integer
 *                           description: Number of records returned in this request
 *                           example: 100
 *                         offset:
 *                           type: integer
 *                           description: Number of records skipped
 *                           example: 0
 *                         hasMore:
 *                           type: boolean
 *                           description: Whether there are more records available
 *                           example: true
 *             example:
 *               success: true
 *               errorCode: 0
 *               value:
 *                 items:
 *                   - id: 1
 *                     shk: "1234567890"
 *                     name: "Товар 1"
 *                     wr_shk: "CELL001"
 *                     wr_name: "Склад А - Ячейка 001"
 *                     kolvo: 10
 *                     condition: "Good"
 *                     reason: "Storage"
 *                     ispolnitel: "Иванов И.И."
 *                     date: "2024-01-15T10:30:00.000Z"
 *                     date_upd: "2024-01-16T14:20:00.000Z"
 *                   - id: 2
 *                     shk: "9876543210"
 *                     name: "Товар 2"
 *                     wr_shk: "CELL002"
 *                     wr_name: "Склад Б - Ячейка 002"
 *                     kolvo: 5
 *                     condition: "Excellent"
 *                     reason: null
 *                     ispolnitel: "Петров П.П."
 *                     date: "2024-01-14T09:15:00.000Z"
 *                     date_upd: null
 *                 pagination:
 *                   total: 1500
 *                   limit: 100
 *                   offset: 0
 *                   hasMore: true
 *       400:
 *         description: Bad request - invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 400
 *               value:
 *                 error: "Invalid pagination parameters"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               errorCode: 500
 *               value:
 *                 error: "Internal server error"
 */
router.get('/all', x3plController.getAllRecords);

module.exports = router; 