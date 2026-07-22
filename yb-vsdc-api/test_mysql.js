import mysql from 'mysql2/promise';

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Default XAMPP password is empty
            port: 3306
        });
        console.log('Successfully connected to MySQL!');
        await connection.end();
    } catch (error) {
        console.error('Failed to connect to MySQL:', error.message);
    }
}

testConnection();
