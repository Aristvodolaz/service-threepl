const x3plService = require('../services/x3plService');

class X3PLController {
  /**
   * Handle POST request to add new record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addRecord(req, res) {
    try {
      // Log incoming request
      console.log('Received POST /x3pl/add request:', req.body);

      // Call service to process the request
      const result = await x3plService.addRecord(req.body);

      if (result.success) {
        // Success response
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {}
        });
      } else {
        // Business logic error
        res.status(400).json({
          success: false,
          errorCode: 400,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle POST request to add minimal record with only shk and name
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addMinimalRecord(req, res) {
    try {
      // Log incoming request
      console.log('Received POST /x3pl/add-minimal request:', req.body);

      // Call service to process the minimal record request
      const result = await x3plService.addMinimalRecord(req.body);

      if (result.success) {
        // Success response with inserted record data
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: result.data
        });
      } else {
        // Business logic error
        res.status(400).json({
          success: false,
          errorCode: 400,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in addMinimalRecord controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle GET request to get all placed items (razmeshennye)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRazmeshennye(req, res) {
    try {
      // Log incoming request
      console.log('Received GET /x3pl/razmeshennye request');

      // Call service to get placed items
      const result = await x3plService.getRazmeshennye();

      if (result.success) {
        // Success response with data
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {
            items: result.data
          }
        });
      } else {
        // Service error
        res.status(500).json({
          success: false,
          errorCode: 500,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in getRazmeshennye controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle GET request to get all unplaced items (nerazmeshennye)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getNerazmeshennye(req, res) {
    try {
      // Log incoming request
      console.log('Received GET /x3pl/nerazmeshennye request');

      // Call service to get unplaced items
      const result = await x3plService.getNerazmeshennye();

      if (result.success) {
        // Success response with data
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {
            items: result.data
          }
        });
      } else {
        // Service error
        res.status(500).json({
          success: false,
          errorCode: 500,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in getNerazmeshennye controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle POST request to remove items from storage (snyatie)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeItems(req, res) {
    try {
      // Log incoming request
      console.log('Received POST /x3pl/snyatie request:', req.body);

      // Call service to process the removal request
      const result = await x3plService.removeItems(req.body);

      if (result.success) {
        // Success response
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {}
        });
      } else {
        // Business logic error
        res.status(400).json({
          success: false,
          errorCode: 400,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in removeItems controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle GET request to search records by wr_shk
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchByWrShk(req, res) {
    try {
      // Get wr_shk from query parameters
      const { wr_shk } = req.query;
      
      // Log incoming request
      console.log('Received GET /x3pl/search request with wr_shk:', wr_shk);

      // Call service to search records
      const result = await x3plService.searchByWrShk(wr_shk);

      if (result.success) {
        // Success response with data
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {
            items: result.data
          }
        });
      } else {
        // Business logic error (missing wr_shk parameter)
        res.status(400).json({
          success: false,
          errorCode: 400,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in searchByWrShk controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle GET request to search records with LIKE by multiple fields
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchWithLike(req, res) {
    try {
      // Get search parameters from query
      const { wr_name, wr_shk, shk, name } = req.query;
      
      // Log incoming request
      console.log('Received GET /x3pl/search-like request with params:', { wr_name, wr_shk, shk, name });

      // Call service to search records
      const result = await x3plService.searchWithLike({ wr_name, wr_shk, shk, name });

      if (result.success) {
        // Success response with data
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {
            items: result.data
          }
        });
      } else {
        // Business logic error (missing search parameters)
        res.status(400).json({
          success: false,
          errorCode: 400,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in searchWithLike controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle POST request to perform inventory operation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async performInventory(req, res) {
    try {
      // Log incoming request
      console.log('Received POST /x3pl/inventory request:', req.body);

      // Call service to process the inventory request
      const result = await x3plService.performInventory(req.body);

      if (result.success) {
        // Success response
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {}
        });
      } else {
        // Business logic error
        res.status(400).json({
          success: false,
          errorCode: 400,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in performInventory controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle GET request to get all records with all fields
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllRecords(req, res) {
    try {
      // Get pagination parameters from query
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
      
      // Log incoming request
      console.log('Received GET /x3pl/all request with params:', { limit, offset });

      // Call service to get all records
      const result = await x3plService.getAllRecords({ limit, offset });

      if (result.success) {
        // Success response with data and pagination info
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: {
            items: result.data,
            pagination: result.pagination
          }
        });
      } else {
        // Service error
        res.status(500).json({
          success: false,
          errorCode: 500,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in getAllRecords controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }

  /**
   * Handle PUT request to update record with wr_shk and kolvo
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateRecord(req, res) {
    try {
      // Log incoming request
      console.log('Received PUT /x3pl/update request:', req.body);

      // Call service to process the update request
      const result = await x3plService.updateRecord(req.body);

      if (result.success) {
        // Success response with updated record data
        res.status(200).json({
          success: true,
          errorCode: 0,
          value: result.data
        });
      } else {
        // Business logic error
        res.status(400).json({
          success: false,
          errorCode: 400,
          value: {
            error: result.error
          }
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in updateRecord controller:', error);
      
      res.status(500).json({
        success: false,
        errorCode: 500,
        value: {
          error: 'Internal server error'
        }
      });
    }
  }
}

module.exports = new X3PLController(); 