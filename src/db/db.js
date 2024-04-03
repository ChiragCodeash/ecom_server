const mysql = require("mysql2");

const pool = mysql.createPool({
//   host: "mysql:host=54.176.53.93;dbname=ambient",
  host: "localhost",
//   host: "54.176.53.93",
  user: "root",
  password: "",
  database: "ecommerce",
  connectionLimit: 10,
});
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
  connection.release();
});

// Export the connection pool
module.exports = pool.promise();