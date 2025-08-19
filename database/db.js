import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

oracledb.initOracleClient();

export async function testConnection() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });
    console.log("Conexión exitosa a Oracle DB ✅");
    return connection;
  } catch (err) {
    console.error("Error de conexión ❌:", err.message);
    throw err;
  }
}

// 🔎 Ejemplo de consulta a tabla SCCUSTOMER
export async function getCustomers(limit = 5) {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });

    const result = await connection.execute(
      `SELECT * FROM SCCUSTOMER FETCH FIRST :limit ROWS ONLY`,
      { limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
}
