const { execSync } = require('child_process');

const escape = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
};

const query = (sql) => {
  try {
    // console.log('Executing SQL:', sql);
    const output = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`).toString();
    return JSON.parse(output);
  } catch (error) {
    console.error('Database error:', error.message);
    throw error;
  }
};

module.exports = { query, escape };
