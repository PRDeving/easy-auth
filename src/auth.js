import { createHash } from 'crypto'

export const sha256 = input => createHash('sha256').update(input).digest('hex')

export const generateAuthphrase = (identifier, password, secret) => sha256(`${ identifier }${ password }${ sha256(secret) }`)
