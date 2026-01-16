require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

console.log('Testing connection with:');
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD);
console.log('Database:', process.env.DB_NAME);
console.log('---');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Connection failed:', err.message);
  } else {
    console.log('✅ Connection successful!');
    console.log('Current time from database:', res.rows[0].now);
  }
  pool.end();
});