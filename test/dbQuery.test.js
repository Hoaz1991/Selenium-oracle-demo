import { expect } from "chai";
import { getCustomers } from "../database/db.js";

describe("Consulta a SCCUSTOMER", function () {
  this.timeout(20000);

  it("Debería devolver registros de la tabla SCCUSTOMER", async () => {
    const customers = await getCustomers(3);
    console.log("Clientes:", customers);

    expect(customers).to.be.an("array");
    expect(customers.length).to.be.greaterThan(0);
  });
});
