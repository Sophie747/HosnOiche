const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Load .env if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
    try {
        require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
        console.log('seed: loaded .env fallback');
    } catch (e) {
        // ignore
    }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const defaultPlayers = [
    'Sophie',
    'Daniel',
    'Luca',
    'Simon',
    'Thomas',
    'Anja',
    'Leander',
    'Laurenz',
    'Sami',
    'Sonja',
    'Berni'
];

(async () => {
    try {
        for (const name of defaultPlayers) {
            await pool.query('INSERT INTO players (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
            console.log(`seed: ensured player ${name}`);
        }
        console.log('seed: completed');
    } catch (err) {
        console.error('seed: failed', err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
