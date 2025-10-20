import { Database } from "bun:sqlite";

export function initDatabase(): Database {
  const db = new Database("database.sqlite");

  db.run(
    `CREATE TABLE IF NOT EXISTS usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    );`
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS forma_de_pago (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL
    );`);
  db.run(`
    CREATE TABLE IF NOT EXISTS tipo_entrada (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        precio REAL NOT NULL
    );`);
  db.run(`
    CREATE TABLE IF NOT EXISTS pedido (
        id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        id_forma_de_pago INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        total REAL NOT NULL,

        -- Claves Foráneas
        FOREIGN KEY (usuario_id) REFERENCES usuario(id),
        FOREIGN KEY (id_forma_de_pago) REFERENCES forma_de_pago(id)
    );`);
  db.run(`
    CREATE TABLE IF NOT EXISTS entrada (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        -- Clave Foránea al Pedido al que pertenece
        pedido_id INTEGER NOT NULL,

        -- Clave Foránea al Tipo de Entrada (Niño/Adulto/VIP)
        tipo_entrada_id INTEGER NOT NULL,

        edad_visitante INTEGER,
        precio REAL NOT NULL,
        utilizada BOOLEAN NOT NULL DEFAULT 0, -- 0 o 1 para SQLite

        -- Claves Foráneas
        FOREIGN KEY (pedido_id) REFERENCES pedido(id_pedido),
        FOREIGN KEY (tipo_entrada_id) REFERENCES tipo_entrada(id)
    );`);

  return db;
}
