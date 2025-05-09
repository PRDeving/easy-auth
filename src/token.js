import jwt from 'jsonwebtoken'
import { sanitizeObject, sanitizeToken } from './sanitize.js'

export const generateToken = (data, config) => new Promise((res) => {
    const sanitizedData = sanitizeObject(data)
    return res(jwt.sign(sanitizedData, config.secret, {
        expiresIn: config.expiresIn,
        audience: config.audience,
        issuer: config.issuer,
    }))
})

export const verifyToken = (token, config) => new Promise((res, rej) => {
    const sanitizedToken = config.sanitization?.enabled && config.sanitization?.sanitizeTokens 
        ? sanitizeToken(token) 
        : token
    if (!sanitizedToken) return rej(new Error('Invalid token format'))
    
    jwt.verify(sanitizedToken, config.secret, {
        audience: config.audience,
        issuer: config.issuer,
    }, (err, decoded) => {
        if (err) return rej(err)
        return res(decoded)
    })
})
