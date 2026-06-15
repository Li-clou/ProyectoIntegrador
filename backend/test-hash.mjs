import bcrypt from 'bcrypt'
import {SALT_ROUNDS} from './config.js'

console.log('SALT_ROUNDS type:', typeof SALT_ROUNDS, 'value:', SALT_ROUNDS)

try {
  const h1 = bcrypt.hashSync('secret123', SALT_ROUNDS)
  console.log('hashSync with SALT_ROUNDS succeeded, length:', h1.length)
  console.log(h1)
} catch (err) {
  console.error('hashSync with SALT_ROUNDS failed:', err.message)
}

try {
  const rounds = Number(SALT_ROUNDS)
  const h2 = bcrypt.hashSync('secret123', rounds)
  console.log('hashSync with Number(SALT_ROUNDS) succeeded, length:', h2.length)
  console.log(h2)
} catch (err) {
  console.error('hashSync with Number(SALT_ROUNDS) failed:', err.message)
}
