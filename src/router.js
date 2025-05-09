import { Router } from 'express'

import cookie from './cookie.js'
import { generateToken, verifyToken } from './token.js'
import { generateAuthphrase } from './auth.js'
import { sanitizeString, sanitizeObject } from './sanitize.js'

export default (config) => {
    const router = Router()

    router.post('/create', async (req, res) => {
        const sanitizedBody = sanitizeObject(req.body)
        const { identifier, password } = sanitizedBody
        
        const authphrase = generateAuthphrase(
            sanitizeString(identifier), 
            sanitizeString(password), 
            config.secret
        )
        
        const success = await config.onCreate(authphrase, sanitizedBody)
        if (!success) return res.status(400).json({ error: 'Invalid request' })

        const data = await config.onAuth(authphrase)
        if (!data) return res.status(500).json({ error: 'Cant create' })

        const token = await generateToken(data, {
            secret: config.secret,
            expiresIn: config.ttl,
            audience: config.name,
            issuer: config.issuer,
        })

        return cookie(res, token, config).status(200).json(data)
    })

    router.post('/auth', async (req, res) => {
        const sanitizedBody = sanitizeObject(req.body)
        const { identifier, password } = sanitizedBody
        
        const authphrase = generateAuthphrase(
            sanitizeString(identifier), 
            sanitizeString(password), 
            config.secret
        )
        
        const data = await config.onAuth(authphrase)
        if (!data) return res.status(401).json({ error: 'Invalid token' })

        const token = await generateToken(data, {
            secret: config.secret,
            expiresIn: config.ttl,
            audience: config.name,
            issuer: config.issuer,
        })

        return cookie(res, token, config).status(200).json(data)
    })

    return router
}

