# 📘 Guía: Conectar Oracle Database en un Proyecto de Automatización con Selenium + Node.js

Este instructivo muestra cómo integrar una base de datos Oracle en un proyecto de automatización con Selenium WebDriver en Node.js, utilizando Mocha y Chai como framework de pruebas.

---

📂 Estructura del proyecto

```
selenium-oracle-demo/
│── database/
│   └── db.js                # Módulo de conexión y consultas a Oracle DB
│
├── test/
│   ├── dbConnection.test.js # Test de conexión a Oracle
│   ├── dbQuery.test.js      # Test de consulta a tabla (ejemplo SCCUSTOMER)
│   └── selenium.test.js     # Test Selenium (ejemplo Google)
│── .env                     # Variables de entorno (usuario, contraseña, string de conexión)
│── package.json
│── README.md

🔧 Herramientas utilizadas

- **Node.js**  
- **Selenium WebDriver** → Automatización de navegador  
- **Mocha + Chai** → Framework de testing  
- **node-oracledb** → Driver oficial para Oracle DB  
- **Dotenv** → Manejo de credenciales en `.env`  
```
---

## ⚙️ Instalación y dependencias

### 1️⃣ Inicializar proyecto
```bash
mkdir selenium-oracle-demo
cd selenium-oracle-demo
npm init -y
```

### 2️⃣ Instalar dependencias
```bash
npm install selenium-webdriver mocha chai oracledb dotenv
```

### 3️⃣ Configurar `package.json`
Agrega soporte para módulos ESM y script de test:

```json
{
  "type": "module",
  "scripts": {
    "test": "mocha --timeout 60000"
  }
}
```

---

## 📦 Instalar Oracle Instant Client

El driver `oracledb` requiere **Oracle Instant Client**:

1. Descarga desde 👉 [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client.html)  
2. Instálalo (ejemplo en Windows: `C:\oracle\instantclient_21_19`)  
3. Agrega la carpeta al **PATH** de tu sistema  

⚠️ Si usas **Oracle Autonomous Database (ADB)**, necesitarás también el **Wallet** (que incluye `tnsnames.ora` y `sqlnet.ora`).  

---

## 🔑 Configuración de credenciales

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_USER=USUARIO
DB_PASSWORD=CONTRASEÑA
DB_CONNECT_STRING=(DESCRIPTION=(ADDRESS=(PROTOCOL=tcps)(HOST=10.122.2.20)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=mi_servicio))(SECURITY=(SSL_SERVER_DN_MATCH=no)))
```

👉 Importante: en Node.js **NO uses** el prefijo `jdbc:oracle:thin:@`. Solo incluye el bloque `(DESCRIPTION=...)`.

---

## 🖥️ Código de conexión a Oracle

Archivo `database/db.js`:

```js
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
```

---

## 🧪 Pruebas de ejemplo

### 1️⃣ Test de conexión → `test/dbConnection.test.js`

```js
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
```

---

### 2️⃣ Test de consulta → `test/dbQuery.test.js`

```js
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
```

---

### 3️⃣ Test Selenium → `test/selenium.test.js`

```js
import { Builder } from "selenium-webdriver";
import { expect } from "chai";

describe("Prueba con Selenium", function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Debería abrir Google y verificar el título", async () => {
    await driver.get("https://www.google.com");
    const title = await driver.getTitle();
    expect(title).to.include("Google");
  });
});
```

---

## 🚀 Ejecutar pruebas

```bash
npm test
```

📌 Ejemplo de salida:

```
Conexión exitosa a Oracle DB ✅
  ✔ Test de Conexión a Oracle
Clientes: [ { ID: 'C001', NAME: 'Juan Pérez', CITY: 'Medellín' }, ... ]
  ✔ Consulta a SCCUSTOMER
DevTools listening on ws://127.0.0.1:xxxxx/devtools/browser/...
  ✔ Prueba con Selenium

  3 passing (5s)
```


## 📌 Notas finales

- ⚠️ Si aparece `ORA-12154`, revisa tu `DB_CONNECT_STRING`.  
- ⚠️ Si aparece `DPI-1047`, revisa que **Oracle Instant Client** esté instalado y agregado al `PATH`.  
- Para **Oracle Autonomous Database (ADB)**, usa el **Wallet** y configura `TNS_ADMIN` en `.env`.  

---
