import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { mode: 'default' });

const [codes] = await connection.execute('SELECT * FROM monthly_activation_codes');
console.log("All codes:", JSON.stringify(codes, null, 2));

await connection.end();
