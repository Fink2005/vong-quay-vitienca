import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const chunks = ['part-00.txt', 'part-01.txt', 'part-02.txt', 'part-03.txt', 'part-04.txt']

const encoded = chunks
  .map((name) => fs.readFileSync(path.join(root, 'assets-bg', name), 'utf8').trim())
  .join('')

const publicDir = path.join(root, 'public')
fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(path.join(publicDir, 'spa-bg.webp'), Buffer.from(encoded, 'base64'))

console.log('Prepared luxury Vi Tien Cat spa background.')
