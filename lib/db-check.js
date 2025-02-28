const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkDB() {
    try {
        await client.connect();
        const res = await client.query(
            "SELECT * FROM information_schema.tables WHERE table_name = 'Vote';"
        );
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkDB();
