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

module.exports = router; 