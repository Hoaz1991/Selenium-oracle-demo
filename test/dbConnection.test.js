import { expect } from "chai";
import { testConnection } from "../database/db.js";

describe("Test de Conexión a Oracle", function () {
  this.timeout(20000);

  it("Debería conectarse correctamente a Oracle DB", async () => {
    const conn = await testConnection();
    expect(conn).to.not.be.null;
    await conn.close();
  });
});
