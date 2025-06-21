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
   * Add minimal record to X_Three_PL with only shk and name
   * @param {Object} data - Input data containing shk and name
   * @returns {Promise<Object>} Success response or error
   */
  async addMinimalRecord(data) {
    try {
      // Validate input data - only shk and name are required
      const validationErrors = this.validateMinimalData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Insert minimal record into database
      const insertedRecord = await x3plRepository.insertMinimal(data.shk, data.name);

      console.log(`Minimal record inserted successfully with ID: ${insertedRecord.id}`);

      return {
        success: true,
        data: {
          id: insertedRecord.id,
          shk: insertedRecord.shk,
          name: insertedRecord.name,
          date: insertedRecord.date
        }
      };
    } catch (error) {
      console.error('Error in addMinimalRecord service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate minimal record request data
   * @param {Object} data - Input data
   * @returns {Array} Array of validation errors
   */
  validateMinimalData(data) {
    const errors = [];

    if (!data.shk || typeof data.shk !== 'string' || data.shk.trim() === '') {
      errors.push('shk is required and must be a non-empty string');
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }

    return errors;
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
   * Search records with LIKE by multiple fields
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.wr_name - Warehouse name to search for
   * @param {string} searchParams.wr_shk - Warehouse barcode to search for
   * @param {string} searchParams.shk - Product barcode to search for
   * @param {string} searchParams.name - Product name to search for
   * @returns {Promise<Object>} Success response with data or error
   */
  async searchWithLike(searchParams) {
    try {
      // Validate search parameters - at least one parameter should be provided
      const validParams = {};
      let hasValidParams = false;

      if (searchParams.wr_name && typeof searchParams.wr_name === 'string' && searchParams.wr_name.trim() !== '') {
        validParams.wr_name = searchParams.wr_name.trim();
        hasValidParams = true;
      }

      if (searchParams.wr_shk && typeof searchParams.wr_shk === 'string' && searchParams.wr_shk.trim() !== '') {
        validParams.wr_shk = searchParams.wr_shk.trim();
        hasValidParams = true;
      }

      if (searchParams.shk && typeof searchParams.shk === 'string' && searchParams.shk.trim() !== '') {
        validParams.shk = searchParams.shk.trim();
        hasValidParams = true;
      }

      if (searchParams.name && typeof searchParams.name === 'string' && searchParams.name.trim() !== '') {
        validParams.name = searchParams.name.trim();
        hasValidParams = true;
      }

      if (!hasValidParams) {
        return {
          success: false,
          error: 'Необходимо указать хотя бы один параметр поиска (wr_name, wr_shk, shk, name)'
        };
      }

      // Search records in repository
      const items = await x3plRepository.searchWithLike(validParams);

      console.log(`Found ${items.length} records for search params:`, validParams);

      // Return success response with data
      return {
        success: true,
        data: items
      };
    } catch (error) {
      console.error('Error in searchWithLike service:', error);
      
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

  /**
   * Get all records from X_Three_PL table with all fields
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of records to return
   * @param {number} options.offset - Number of records to skip
   * @returns {Promise<Object>} Success response with data or error
   */
  async getAllRecords(options = {}) {
    try {
      // Validate and set default options
      const queryOptions = {
        limit: Math.min(options.limit || 1000, 10000), // Max 10000 records per request
        offset: Math.max(options.offset || 0, 0)
      };

      // Get records from repository
      const items = await x3plRepository.getAllRecords(queryOptions);
      
      // Get total count for pagination info
      const totalCount = await x3plRepository.getTotalRecordsCount();

      console.log(`Retrieved ${items.length} records (offset: ${queryOptions.offset}, limit: ${queryOptions.limit}) from total ${totalCount}`);

      // Return success response with data and pagination info
      return {
        success: true,
        data: items,
        pagination: {
          total: totalCount,
          limit: queryOptions.limit,
          offset: queryOptions.offset,
          hasMore: queryOptions.offset + queryOptions.limit < totalCount
        }
      };
    } catch (error) {
      console.error('Error in getAllRecords service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update record with wr_shk and kolvo
   * @param {Object} data - Input data containing id, wr_shk, and kolvo
   * @returns {Promise<Object>} Success response or error
   */
  async updateRecord(data) {
    try {
      // Validate input data
      const validationErrors = this.validateUpdateData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Check if record exists
      const existingRecord = await x3plRepository.findRecordById(data.id);
      if (!existingRecord) {
        return {
          success: false,
          error: `Record with ID ${data.id} not found`
        };
      }

      // Get warehouse name by wr_shk
      const warehouseName = await x3plRepository.getWarehouseNameBySHK(data.wr_shk);
      
      if (!warehouseName) {
        return {
          success: false,
          error: `Warehouse with SHK '${data.wr_shk}' not found in x_Storage_Scklads`
        };
      }

      // Update record in database
      const updatedRecord = await x3plRepository.updateRecord(
        data.id, 
        data.wr_shk, 
        data.kolvo, 
        warehouseName
      );

      console.log(`Record with ID ${data.id} updated successfully:`, updatedRecord);

      return {
        success: true,
        data: {
          id: updatedRecord.id,
          wr_shk: updatedRecord.wr_shk,
          wr_name: updatedRecord.wr_name,
          kolvo: updatedRecord.kolvo,
          date_upd: updatedRecord.date_upd
        }
      };
    } catch (error) {
      console.error('Error in updateRecord service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update record with extended fields including ispolnitel, condition, and reason
   * @param {Object} data - Input data containing id, wr_shk, kolvo, ispolnitel, condition, reason
   * @returns {Promise<Object>} Success response or error
   */
  async updateRecord(data) {
    try {
      // Validate input data
      const validationErrors = this.validateUpdateData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Check if record exists
      const existingRecord = await x3plRepository.findRecordById(data.id);
      if (!existingRecord) {
        return {
          success: false,
          error: `Record with ID ${data.id} not found`
        };
      }

      // Get warehouse name by wr_shk
      const warehouseName = await x3plRepository.getWarehouseNameBySHK(data.wr_shk);
      
      if (!warehouseName) {
        return {
          success: false,
          error: `Warehouse with SHK '${data.wr_shk}' not found in x_Storage_Scklads`
        };
      }

      // Prepare update data
      const updateData = {
        wr_shk: data.wr_shk,
        wr_name: warehouseName,
        kolvo: data.kolvo,
        ispolnitel: data.ispolnitel || null,
        condition: data.condition || null,
        reason: data.reason || null
      };

      // Update record in database with extended fields
      const updatedRecord = await x3plRepository.updateRecordExtended(data.id, updateData);

      console.log(`Record with ID ${data.id} updated successfully with extended fields:`, updatedRecord);

      return {
        success: true,
        data: {
          id: updatedRecord.id,
          wr_shk: updatedRecord.wr_shk,
          wr_name: updatedRecord.wr_name,
          kolvo: updatedRecord.kolvo,
          ispolnitel: updatedRecord.ispolnitel,
          condition: updatedRecord.condition,
          reason: updatedRecord.reason,
          date_upd: updatedRecord.date_upd
        }
      };
    } catch (error) {
      console.error('Error in updateRecord service:', error);
      
      // Return error response
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate update record request data
   * @param {Object} data - Input data
   * @returns {Array} Array of validation errors
   */
  validateUpdateData(data) {
    const errors = [];

    if (!data.id || typeof data.id !== 'number' || data.id <= 0) {
      errors.push('id is required and must be a positive number');
    }

    if (!data.wr_shk || typeof data.wr_shk !== 'string' || data.wr_shk.trim() === '') {
      errors.push('wr_shk is required and must be a non-empty string');
    }

    // Convert kolvo to number if it's a string
    const kolvo = typeof data.kolvo === 'string' ? parseInt(data.kolvo, 10) : data.kolvo;
    if (kolvo === undefined || kolvo === null || typeof kolvo !== 'number' || kolvo < 0 || isNaN(kolvo)) {
      errors.push('kolvo is required and must be a non-negative number');
    }

    // Optional fields validation
    if (data.ispolnitel !== undefined && data.ispolnitel !== null && (typeof data.ispolnitel !== 'string' || data.ispolnitel.trim() === '')) {
      errors.push('ispolnitel must be a non-empty string if provided');
    }

    if (data.condition !== undefined && data.condition !== null && (typeof data.condition !== 'string' || data.condition.trim() === '')) {
      errors.push('condition must be a non-empty string if provided');
    }

    if (data.reason !== undefined && data.reason !== null && (typeof data.reason !== 'string' || data.reason.trim() === '')) {
      errors.push('reason must be a non-empty string if provided');
    }

    return errors;
  }
}

module.exports = new X3PLService(); 