/**
 * Script to generate a secure random string for NextAuth.js NEXTAUTH_SECRET
 * 
 * Run with: node scripts/generate-auth-secret.js
 */

const crypto = require('crypto');

// Generate a secure random string (32 bytes)
const secret = crypto.randomBytes(32).toString('hex');

console.log('Generated NextAuth Secret:');
console.log(secret);
console.log('\nAdd this to your .env file as:');
console.log(`NEXTAUTH_SECRET=${secret}`); 