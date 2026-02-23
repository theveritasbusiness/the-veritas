import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "Zur866765850",
  database: "veritas_cms",
});

export default pool;
