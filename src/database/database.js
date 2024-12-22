
const {Client} = require('pg')

const connection = new Client({
  connectionString: 'postgresql://postgres:1993@localhost:5432/healtestdb'
});

connection.connect();

module.exports = { connection };