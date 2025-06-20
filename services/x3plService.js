const x3plRepository = require('../repositories/x3plRepository');
const X3PLModel = require('../models/x3plModel');

class X3PLService {
  /**
   * Add new record to X_Three_PL
   * @param {Object} data - Input data from request
   * @returns {Promise<Object>} Success response or error
   */
  async addRecord(data) {
    try {
      // Create model instance
      const model = new X3PLModel(data);

      // Validate input data
      const validationErrors = model.validate();
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Get warehouse name by wr_shk
      const warehouseName = await x3plRepository.getWarehouseNameBySHK(model.wr_shk);
      
      if (!warehouseName) {
        throw new Error(`Warehouse with SHK '${model.wr_shk}' not found in x_Storage_Scklads`);
      }

      // Set warehouse name
      model.wr_name = warehouseName;

      // Ensure date is set to current datetime and date_upd is null
      model.date = new Date();
      model.date_upd = null;

      // Convert model to database object
      const dbObject = model.toDbObject();

      // Insert record into database
      const insertedRecord = await x3plRepository.insert(dbObject);

      console.log(`Record inserted successfully with ID: ${insertedRecord.id}`);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in addRecord service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all placed items (razmeshennye)
   * @returns {Promise<Object>} Success response with data or error
   */
  async getRazmeshennye() {
    try {
      // Get placed items from repository
      const items = await x3plRepository.getRazmeshennye();

      console.log(`Retrieved ${items.length} razmeshennye records`);

      // Return success response with data
      return {
        success: true,
        data: items
      };
    } catch (error) {
      console.error('Error in getRazmeshennye service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all unplaced items (nerazmeshennye)
   * @returns {Promise<Object>} Success response with data or error
   */
  async getNerazmeshennye() {
    try {
      // Get unplaced items from repository
      const items = await x3plRepository.getNerazmeshennye();

      console.log(`Retrieved ${items.length} nerazmeshennye records`);

      // Return success response with data
      return {
        success: true,
        data: items
      };
    } catch (error) {
      console.error('Error in getNerazmeshennye service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove items from storage (snyatie)
   * @param {Object} data - Input data from request
   * @returns {Promise<Object>} Success response or error
   */
  async removeItems(data) {
    try {
      // Validate input data
      const validationErrors = this.validateRemovalData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Find record that matches conditions
      const foundRecord = await x3plRepository.findRecordForRemoval({
        shk: data.shk,
        wr_shk: data.wr_shk,
        condition: data.condition,
        kolvo: data.kolvo
      });

      if (!foundRecord) {
        return {
          success: false,
          error: 'Недостаточное количество или запись не найдена'
        };
      }

      // Check if we need to delete or update the record
      if (data.kolvo === foundRecord.kolvo) {
        // Delete the entire record
        await x3plRepository.deleteRecord(foundRecord.id);
        console.log(`Record with ID ${foundRecord.id} deleted completely`);
      } else {
        // Update the record with reduced quantity
        const newKolvo = foundRecord.kolvo - data.kolvo;
        await x3plRepository.updateRecordQuantity(foundRecord.id, newKolvo);
        console.log(`Record with ID ${foundRecord.id} updated: ${foundRecord.kolvo} -> ${newKolvo}`);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in removeItems service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate removal request data
   * @param {Object} data - Input data
   * @returns {Array} Array of validation errors
   */
  validateRemovalData(data) {
    const errors = [];

    if (!data.shk || typeof data.shk !== 'string' || data.shk.trim() === '') {
      errors.push('shk is required and must be a non-empty string');
    }

    if (!data.wr_shk || typeof data.wr_shk !== 'string' || data.wr_shk.trim() === '') {
      errors.push('wr_shk is required and must be a non-empty string');
    }

    if (!data.condition || typeof data.condition !== 'string' || data.condition.trim() === '') {
      errors.push('condition is required and must be a non-empty string');
    }

    // Convert kolvo to number if it's a string
    const kolvo = typeof data.kolvo === 'string' ? parseInt(data.kolvo, 10) : data.kolvo;
    if (kolvo === undefined || kolvo === null || typeof kolvo !== 'number' || kolvo < 1 || isNaN(kolvo)) {
      errors.push('kolvo is required and must be a positive number');
    }

    return errors;
  }

  /**
   * Search records by wr_shk
   * @param {string} wr_shk - Warehouse barcode to search for
   * @returns {Promise<Object>} Success response with data or error
   */
  async searchByWrShk(wr_shk) {
    try {
      // Validate wr_shk parameter
      if (!wr_shk || typeof wr_shk !== 'string' || wr_shk.trim() === '') {
        return {
          success: false,
          error: 'Параметр wr_shk обязателен'
        };
      }

      // Search records in repository
      const items = await x3plRepository.searchByWrShk(wr_shk.trim());

      console.log(`Found ${items.length} records for wr_shk: ${wr_shk}`);

      // Return success response with data
      return {
        success: true,
        data: items
      };
    } catch (error) {
      console.error('Error in searchByWrShk service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform inventory operation
   * @param {Object} data - Input data from request
   * @returns {Promise<Object>} Success response or error
   */
  async performInventory(data) {
    try {
      // Validate input data
      const validationErrors = this.validateInventoryData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Find record that matches conditions
      const foundRecord = await x3plRepository.findRecordForInventory({
        shk: data.shk,
        wr_shk: data.wr_shk,
        condition: data.condition
      });

      if (!foundRecord) {
        return {
          success: false,
          error: 'Запись не найдена'
        };
      }

      // Check if we need to delete or update the record
      if (data.kolvo === 0) {
        // Delete the record
        await x3plRepository.deleteRecord(foundRecord.id);
        console.log(`Record with ID ${foundRecord.id} deleted during inventory`);
      } else {
        // Update the record
        await x3plRepository.updateRecordForInventory(foundRecord.id, {
          kolvo: data.kolvo,
          condition: data.condition,
          reason: data.reason
        });
        console.log(`Record with ID ${foundRecord.id} updated during inventory: kolvo=${data.kolvo}`);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in performInventory service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate inventory request data
   * @param {Object} data - Input data
   * @returns {Array} Array of validation errors
   */
  validateInventoryData(data) {
    const errors = [];

    if (!data.shk || typeof data.shk !== 'string' || data.shk.trim() === '') {
      errors.push('shk is required and must be a non-empty string');
    }

    if (!data.wr_shk || typeof data.wr_shk !== 'string' || data.wr_shk.trim() === '') {
      errors.push('wr_shk is required and must be a non-empty string');
    }

    if (!data.condition || typeof data.condition !== 'string' || data.condition.trim() === '') {
      errors.push('condition is required and must be a non-empty string');
    }

    // Convert kolvo to number if it's a string and update the data object
    if (typeof data.kolvo === 'string') {
      data.kolvo = parseInt(data.kolvo, 10);
    }
    
    if (data.kolvo === undefined || data.kolvo === null || typeof data.kolvo !== 'number' || data.kolvo < 0 || isNaN(data.kolvo)) {
      errors.push('kolvo is required and must be a non-negative number');
    }

    return errors;
  }

  /**
   * Initialize database table if needed
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    try {
      await x3plRepository.createTableIfNotExists();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
}

module.exports = new X3PLService(); 