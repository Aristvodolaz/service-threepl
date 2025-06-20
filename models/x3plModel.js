// Model for X_Three_PL data
class X3PLModel {
  constructor(data) {
    this.shk = data.shk;
    this.name = data.name;
    this.wr_shk = data.wr_shk;
    this.wr_name = data.wr_name || null;
    // Convert kolvo to number if it's a string
    this.kolvo = typeof data.kolvo === 'string' ? parseInt(data.kolvo, 10) : data.kolvo;
    this.condition = data.condition;
    this.reason = data.reason || null;
    this.ispolnitel = data.ispolnitel;
    this.date = data.date || new Date();
    this.date_upd = data.date_upd || null;
  }

  // Validate required fields
  validate() {
    const errors = [];

    if (!this.shk || typeof this.shk !== 'string' || this.shk.trim() === '') {
      errors.push('shk is required and must be a non-empty string');
    }

    if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }

    if (!this.wr_shk || typeof this.wr_shk !== 'string' || this.wr_shk.trim() === '') {
      errors.push('wr_shk is required and must be a non-empty string');
    }

    if (this.kolvo === undefined || this.kolvo === null || typeof this.kolvo !== 'number' || this.kolvo < 1) {
      errors.push('kolvo is required and must be a positive number');
    }

    if (!this.condition || typeof this.condition !== 'string' || this.condition.trim() === '') {
      errors.push('condition is required and must be a non-empty string');
    }

    if (!this.ispolnitel || typeof this.ispolnitel !== 'string' || this.ispolnitel.trim() === '') {
      errors.push('ispolnitel is required and must be a non-empty string');
    }

    return errors;
  }

  // Convert to object for database insertion
  toDbObject() {
    return {
      shk: this.shk,
      name: this.name,
      wr_shk: this.wr_shk,
      wr_name: this.wr_name,
      kolvo: this.kolvo,
      condition: this.condition,
      reason: this.reason,
      ispolnitel: this.ispolnitel,
      date: this.date,
      date_upd: this.date_upd
    };
  }
}

module.exports = X3PLModel; 