
const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    const targetDb = process.env.DB_DATABASE || 'yb_vsdc_api';

    // Connect to default 'postgres' database to create the new one
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log('Connected to postgres database.');

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${targetDb}'`);
        if (res.rowCount === 0) {
            console.log(`Database ${targetDb} does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${targetDb}"`);
            console.log(`Database ${targetDb} created successfully!`);
        } else {
            console.log(`Database ${targetDb} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
