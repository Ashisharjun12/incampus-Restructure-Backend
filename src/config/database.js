import postgres from "postgres";
import { _config } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";


const queryString = _config.DATABASE_URI;

export const connection = postgres(queryString);

export const db = drizzle(connection);

