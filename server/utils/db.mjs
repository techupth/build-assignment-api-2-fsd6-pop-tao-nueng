// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:std5511pe@localhost:5432/my-assignment-1",
  //"postgresql://username:password@localhost:5432/you-db-name"
});

export default connectionPool;
