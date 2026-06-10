require('dotenv').config()
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function run() {
  // Create database if it doesn't exist
  const adminClient = new Client({
    user: 'postgres',
    password: 'Shazaib123',
    host: 'localhost',
    database: 'postgres',
  })
  await adminClient.connect()

  const res = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = 'BallTalk'"
  )
  if (res.rows.length === 0) {
    await adminClient.query('CREATE DATABASE "BallTalk"')
    console.log('Database "BallTalk" created')
  } else {
    console.log('Database "BallTalk" already exists')
  }
  await adminClient.end()

  // Run migration
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/001_users.sql'), 'utf8')
  await client.query(sql)
  console.log('Migration 001_users applied')
  await client.end()
}

run().catch(err => {
  console.error(err.message)
  process.exit(1)
})
