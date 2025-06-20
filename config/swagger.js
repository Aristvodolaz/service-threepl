const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X_Three_PL Service API',
      version: '1.0.0',
      description: 'API documentation for X_Three_PL operations with SQL Server',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3010}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        X3PLAddRequest: {
          type: 'object',
          required: ['shk', 'name', 'wr_shk', 'kolvo', 'condition', 'ispolnitel'],
          properties: {
            shk: {
              type: 'string',
              description: 'Product barcode',
              example: '1234567890'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Product Name'
            },
            wr_shk: {
              type: 'string',
              description: 'Warehouse barcode',
              example: '0987654321'
            },
            kolvo: {
              type: 'integer',
              description: 'Quantity',
              example: 10,
              minimum: 1
            },
            condition: {
              type: 'string',
              description: 'Condition of the product',
              example: 'Good'
            },
            reason: {
              type: 'string',
              description: 'Reason (optional)',
              example: 'Return from customer'
            },
            ispolnitel: {
              type: 'string',
              description: 'Executor name',
              example: 'John Doe'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            errorCode: {
              type: 'integer',
              example: 0
            },
            value: {
              type: 'object',
              example: {}
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            errorCode: {
              type: 'integer',
              example: 400
            },
            value: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Error message'
                }
              }
            }
          }
        },
        ItemsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            errorCode: {
              type: 'integer',
              example: 0
            },
            value: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object'
                  }
                }
              }
            }
          }
        },
        X3PLRazmeshennye: {
          type: 'object',
          properties: {
            shk: {
              type: 'string',
              description: 'Product barcode',
              example: '1234567890'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Product Name'
            },
            wr_shk: {
              type: 'string',
              description: 'Warehouse barcode',
              example: '0987654321'
            },
            wr_name: {
              type: 'string',
              description: 'Warehouse name',
              example: 'Warehouse A'
            },
            kolvo: {
              type: 'integer',
              description: 'Quantity',
              example: 10,
              minimum: 1
            },
            condition: {
              type: 'string',
              description: 'Condition of the product',
              example: 'Good'
            },
            reason: {
              type: 'string',
              description: 'Reason (optional)',
              example: 'Return from customer',
              nullable: true
            }
          }
        },
        X3PLNerazmeshennye: {
          type: 'object',
          properties: {
            shk: {
              type: 'string',
              description: 'Product barcode',
              example: '9876543210'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Unplaced Product'
            },
            wr_shk: {
              type: 'string',
              description: 'Warehouse barcode (empty for unplaced items)',
              example: '',
              nullable: true
            },
            wr_name: {
              type: 'string',
              description: 'Warehouse name (empty for unplaced items)',
              example: '',
              nullable: true
            },
            kolvo: {
              type: 'integer',
              description: 'Quantity (always 0 for unplaced items)',
              example: 0,
              enum: [0]
            },
            condition: {
              type: 'string',
              description: 'Condition of the product',
              example: 'Pending'
            },
            reason: {
              type: 'string',
              description: 'Reason (optional)',
              example: 'Awaiting placement',
              nullable: true
            }
          }
        },
        X3PLSnyatieRequest: {
          type: 'object',
          required: ['shk', 'wr_shk', 'condition', 'kolvo'],
          properties: {
            shk: {
              type: 'string',
              description: 'Product barcode',
              example: '1234567890'
            },
            wr_shk: {
              type: 'string',
              description: 'Warehouse barcode',
              example: '0987654321'
            },
            condition: {
              type: 'string',
              description: 'Condition of the product',
              example: 'Good'
            },
            kolvo: {
              type: 'integer',
              description: 'Quantity to remove',
              example: 5,
              minimum: 1
            }
          }
        },
        X3PLInventoryRequest: {
          type: 'object',
          required: ['shk', 'wr_shk', 'condition', 'kolvo'],
          properties: {
            shk: {
              type: 'string',
              description: 'Product barcode',
              example: '1234567890'
            },
            wr_shk: {
              type: 'string',
              description: 'Warehouse cell barcode',
              example: 'CELL001'
            },
            condition: {
              type: 'string',
              description: 'Product condition',
              example: 'Некондиция'
            },
            reason: {
              type: 'string',
              description: 'Reason for inventory change (optional)',
              example: 'Повреждение упаковки'
            },
            kolvo: {
              type: 'integer',
              minimum: 0,
              description: 'New quantity (0 will delete the record)',
              example: 0
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 