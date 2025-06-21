const { sql, poolPromise } = require('../config/db');

class X3PLRepository {
  /**
   * Get warehouse name by SHK from x_Storage_Scklads table
   * @param {string} wr_shk - Warehouse barcode
   * @returns {Promise<string|null>} Warehouse name or null if not found
   */
  async getWarehouseNameBySHK(wr_shk) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('wr_shk', sql.NVarChar(100), wr_shk)
        .query(`
          SELECT TOP 1 [Name]
          FROM [SPOe_rc].[dbo].[x_Storage_Scklads]
          WHERE [SHK] = @wr_shk
        `);

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0].Name;
      }
      return null;
    } catch (error) {
      console.error('Error getting warehouse name:', error);
      throw new Error(`Failed to get warehouse name: ${error.message}`);
    }
  }

  /**
   * Insert new record into X_Three_PL table
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Inserted record with ID
   */
  async insert(data) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('shk', sql.NVarChar(100), data.shk)
        .input('name', sql.NVarChar(255), data.name)
        .input('wr_shk', sql.NVarChar(100), data.wr_shk)
        .input('wr_name', sql.NVarChar(255), data.wr_name)
        .input('kolvo', sql.Int, data.kolvo)
        .input('condition', sql.NVarChar(100), data.condition)
        .input('reason', sql.NVarChar(255), data.reason)
        .input('ispolnitel', sql.NVarChar(255), data.ispolnitel)
        .input('date', sql.DateTime, data.date)
        .input('date_upd', sql.DateTime, data.date_upd)
        .query(`
          INSERT INTO dbo.X_Three_PL 
          (shk, name, wr_shk, wr_name, kolvo, condition, reason, ispolnitel, date, date_upd)
          VALUES 
          (@shk, @name, @wr_shk, @wr_name, @kolvo, @condition, @reason, @ispolnitel, @date, @date_upd);
          
          SELECT SCOPE_IDENTITY() as id;
        `);

      if (result.recordset && result.recordset.length > 0) {
        return {
          id: result.recordset[0].id,
          ...data
        };
      }
      throw new Error('Failed to insert record');
    } catch (error) {
      console.error('Error inserting record:', error);
      throw new Error(`Failed to insert record: ${error.message}`);
    }
  }

  /**
   * Check if X_Three_PL table exists
   * @returns {Promise<boolean>} True if table exists
   */
  async checkTableExists() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = 'dbo' 
          AND TABLE_NAME = 'X_Three_PL'
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking table existence:', error);
      throw new Error(`Failed to check table existence: ${error.message}`);
    }
  }

  /**
   * Get all placed items (razmeshennye) from X_Three_PL table
   * @returns {Promise<Array>} Array of placed items
   */
  async getRazmeshennye() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT 
            shk,
            name,
            wr_shk,
            wr_name,
            kolvo,
            condition,
            reason
          FROM dbo.X_Three_PL
          WHERE kolvo > 0
            AND wr_shk IS NOT NULL 
            AND wr_shk != ''
            AND wr_name IS NOT NULL 
            AND wr_name != ''
          ORDER BY date DESC
        `);

      return result.recordset || [];
    } catch (error) {
      console.error('Error getting razmeshennye records:', error);
      throw new Error(`Failed to get razmeshennye records: ${error.message}`);
    }
  }

  /**
   * Get all unplaced items (nerazmeshennye) from X_Three_PL table
   * @returns {Promise<Array>} Array of unplaced items
   */
  async getNerazmeshennye() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT 
            shk,
            name,
            wr_shk,
            wr_name,
            kolvo,
            condition,
            reason
          FROM dbo.X_Three_PL
          WHERE kolvo = 0
            AND (wr_shk IS NULL OR wr_shk = '')
            AND (wr_name IS NULL OR wr_name = '')
          ORDER BY date DESC
        `);

      return result.recordset || [];
    } catch (error) {
      console.error('Error getting nerazmeshennye records:', error);
      throw new Error(`Failed to get nerazmeshennye records: ${error.message}`);
    }
  }

  /**
   * Find record for removal by conditions
   * @param {Object} conditions - Search conditions
   * @returns {Promise<Object|null>} Found record or null
   */
  async findRecordForRemoval(conditions) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('shk', sql.NVarChar(100), conditions.shk)
        .input('wr_shk', sql.NVarChar(100), conditions.wr_shk)
        .input('condition', sql.NVarChar(100), conditions.condition)
        .input('kolvo', sql.Int, conditions.kolvo)
        .query(`
          SELECT TOP 1 id, shk, name, wr_shk, wr_name, kolvo, condition, reason, ispolnitel, date, date_upd
          FROM dbo.X_Three_PL
          WHERE shk = @shk
            AND wr_shk = @wr_shk
            AND condition = @condition
            AND kolvo >= @kolvo
          ORDER BY date ASC
        `);

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding record for removal:', error);
      throw new Error(`Failed to find record for removal: ${error.message}`);
    }
  }

  /**
   * Update record quantity and date_upd
   * @param {number} id - Record ID
   * @param {number} newKolvo - New quantity
   * @returns {Promise<Object>} Updated record info
   */
  async updateRecordQuantity(id, newKolvo) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('newKolvo', sql.Int, newKolvo)
        .input('dateUpd', sql.DateTime, new Date())
        .query(`
          UPDATE dbo.X_Three_PL
          SET kolvo = @newKolvo, date_upd = @dateUpd
          WHERE id = @id;
          
          SELECT @@ROWCOUNT as affectedRows;
        `);

      if (result.recordset && result.recordset[0].affectedRows > 0) {
        return { id, newKolvo, updated: true };
      }
      throw new Error('No rows were updated');
    } catch (error) {
      console.error('Error updating record quantity:', error);
      throw new Error(`Failed to update record quantity: ${error.message}`);
    }
  }

  /**
   * Delete record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRecord(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          DELETE FROM dbo.X_Three_PL
          WHERE id = @id;
          
          SELECT @@ROWCOUNT as affectedRows;
        `);

      if (result.recordset && result.recordset[0].affectedRows > 0) {
        return { id, deleted: true };
      }
      throw new Error('No rows were deleted');
    } catch (error) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }

  /**
   * Search records by wr_shk
   * @param {string} wr_shk - Warehouse barcode to search for
   * @returns {Promise<Array>} Array of found records
   */
  async searchByWrShk(wr_shk) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('wr_shk', sql.NVarChar(100), wr_shk)
        .query(`
          SELECT 
            shk,
            name,
            wr_shk,
            wr_name,
            kolvo,
            condition,
            reason
          FROM dbo.X_Three_PL
          WHERE wr_shk = @wr_shk
          ORDER BY date DESC
        `);

      return result.recordset || [];
    } catch (error) {
      console.error('Error searching records by wr_shk:', error);
      throw new Error(`Failed to search records by wr_shk: ${error.message}`);
    }
  }

  /**
   * Search records with LIKE by multiple fields
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.wr_name - Warehouse name to search for
   * @param {string} searchParams.wr_shk - Warehouse barcode to search for
   * @param {string} searchParams.shk - Product barcode to search for
   * @param {string} searchParams.name - Product name to search for
   * @returns {Promise<Array>} Array of found records
   */
  async searchWithLike(searchParams) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
      
      // Build WHERE conditions dynamically
      const conditions = [];
      
      if (searchParams.wr_name) {
        conditions.push('wr_name LIKE @wr_name');
        request.input('wr_name', sql.NVarChar(255), `%${searchParams.wr_name}%`);
      }
      
      if (searchParams.wr_shk) {
        conditions.push('wr_shk LIKE @wr_shk');
        request.input('wr_shk', sql.NVarChar(100), `%${searchParams.wr_shk}%`);
      }
      
      if (searchParams.shk) {
        conditions.push('shk LIKE @shk');
        request.input('shk', sql.NVarChar(100), `%${searchParams.shk}%`);
      }
      
      if (searchParams.name) {
        conditions.push('name LIKE @name');
        request.input('name', sql.NVarChar(255), `%${searchParams.name}%`);
      }
      
      // If no search parameters provided, return empty array
      if (conditions.length === 0) {
        return [];
      }
      
      const whereClause = conditions.join(' OR ');
      
      const result = await request.query(`
        SELECT 
          shk,
          name,
          wr_shk,
          wr_name,
          kolvo,
          condition,
          reason
        FROM dbo.X_Three_PL
        WHERE ${whereClause}
        ORDER BY date DESC
      `);

      return result.recordset || [];
    } catch (error) {
      console.error('Error searching records with LIKE:', error);
      throw new Error(`Failed to search records with LIKE: ${error.message}`);
    }
  }

  /**
   * Find record for inventory by conditions
   * @param {Object} conditions - Search conditions
   * @returns {Promise<Object|null>} Found record or null
   */
  async findRecordForInventory(conditions) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('shk', sql.NVarChar(100), conditions.shk)
        .input('wr_shk', sql.NVarChar(100), conditions.wr_shk)
        .input('condition', sql.NVarChar(100), conditions.condition)
        .query(`
          SELECT TOP 1 id, shk, name, wr_shk, wr_name, kolvo, condition, reason, ispolnitel, date, date_upd
          FROM dbo.X_Three_PL
          WHERE shk = @shk
            AND wr_shk = @wr_shk
            AND condition = @condition
          ORDER BY date DESC
        `);

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding record for inventory:', error);
      throw new Error(`Failed to find record for inventory: ${error.message}`);
    }
  }

  /**
   * Update record for inventory
   * @param {number} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateRecordForInventory(id, data) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('kolvo', sql.Int, data.kolvo)
        .input('condition', sql.NVarChar(100), data.condition)
        .input('reason', sql.NVarChar(255), data.reason)
        .input('dateUpd', sql.DateTime, new Date())
        .query(`
          UPDATE dbo.X_Three_PL
          SET kolvo = @kolvo,
              condition = @condition,
              reason = @reason,
              date_upd = @dateUpd
          WHERE id = @id;
          
          SELECT @@ROWCOUNT as affectedRows;
        `);

      if (result.recordset && result.recordset[0].affectedRows > 0) {
        return { id, updated: true };
      }
      throw new Error('No rows were updated');
    } catch (error) {
      console.error('Error updating record for inventory:', error);
      throw new Error(`Failed to update record for inventory: ${error.message}`);
    }
  }

  /**
   * Create X_Three_PL table if it doesn't exist
   * @returns {Promise<void>}
   */
  async createTableIfNotExists() {
    try {
      const exists = await this.checkTableExists();
      if (!exists) {
        const pool = await poolPromise;
        await pool.request().query(`
          CREATE TABLE dbo.X_Three_PL (
            id INT IDENTITY(1,1) PRIMARY KEY,
            shk NVARCHAR(100) NOT NULL,
            name NVARCHAR(255) NOT NULL,
            wr_shk NVARCHAR(100),
            wr_name NVARCHAR(255),
            kolvo INT NOT NULL,
            condition NVARCHAR(100),
            reason NVARCHAR(255),
            ispolnitel NVARCHAR(255),
            date DATETIME NOT NULL DEFAULT GETDATE(),
            date_upd DATETIME NULL
          );
        `);
        console.log('Table X_Three_PL created successfully');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      throw new Error(`Failed to create table: ${error.message}`);
    }
  }

  /**
   * Get all records from X_Three_PL table with all fields
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of records to return (default: 1000)
   * @param {number} options.offset - Number of records to skip (default: 0)
   * @returns {Promise<Array>} Array of all records with complete data
   */
  async getAllRecords(options = {}) {
    try {
      const pool = await poolPromise;
      const limit = options.limit || 1000;
      const offset = options.offset || 0;
      
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(`
          SELECT 
            id,
            shk,
            name,
            wr_shk,
            wr_name,
            kolvo,
            condition,
            reason,
            ispolnitel,
            date,
            date_upd
          FROM dbo.X_Three_PL
          ORDER BY date DESC
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
        `);

      return result.recordset || [];
    } catch (error) {
      console.error('Error getting all records:', error);
      throw new Error(`Failed to get all records: ${error.message}`);
    }
  }

  /**
   * Get total count of records in X_Three_PL table
   * @returns {Promise<number>} Total number of records
   */
  async getTotalRecordsCount() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT COUNT(*) as total
          FROM dbo.X_Three_PL
        `);

      return result.recordset[0].total || 0;
    } catch (error) {
      console.error('Error getting total records count:', error);
      throw new Error(`Failed to get total records count: ${error.message}`);
    }
  }
}

module.exports = new X3PLRepository(); 