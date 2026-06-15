import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'
import {SALT_ROUNDS} from './config.js'

const dbPath = path.resolve('./backend/db/User.json')

const isHashed = (pw) => typeof pw === 'string' && /^\$2[aby]\$/.test(pw)

const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
let changed = 0

const newData = data.map(user => {
  if (!user.password) return user
  if (isHashed(user.password)) return user
  const rounds = Number(SALT_ROUNDS) || 10
  const hashed = bcrypt.hashSync(String(user.password), rounds)
  changed++
  return { ...user, password: hashed }
})

if (changed === 0) {
  console.log('No se encontraron contraseñas en texto plano.')
} else {
  fs.writeFileSync(dbPath, JSON.stringify(newData, null, 2), 'utf8')
  console.log(`Hasheadas ${changed} contraseñas y actualizado ${dbPath}`)
}
