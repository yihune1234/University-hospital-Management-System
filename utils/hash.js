const bcrypt = require('bcryptjs');

module.exports = {
  hashPassword(password) {
    return bcrypt.hash(password, 10);
  },

  comparePassword(password, hashed) {
    return bcrypt.compare(password, hashed);
  }
};
