import { Router } from 'express'

import cookie from './cookie.js'
import { generateToken, verifyToken } from './token.js'
import { generateAuthphrase } from './auth.js'
import { sanitizeInput } from './sanitize.js'

export default (config) => {
    const router = Router()

    router.post('/create', async (req, res) => {
        try {
            const identifier = sanitizeInput(req.body.identifier, config.inputPattern)
            const password = sanitizeInput(req.body.password, config.inputPattern)
            
            const authphrase = generateAuthphrase(identifier, password, config.secret)
            
            const success = await config.onCreate(authphrase, req.body)
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
        } catch (error) {
            return res.status(400).json({ error: 'Invalid input format' })
        }
    })

    router.post('/auth', async (req, res) => {
        try {
            const identifier = sanitizeInput(req.body.identifier, config.inputPattern)
            const password = sanitizeInput(req.body.password, config.inputPattern)
            
            const authphrase = generateAuthphrase(identifier, password, config.secret)
            const data = await config.onAuth(authphrase)
            if (!data) return res.status(401).json({ error: 'Invalid token' })

            const token = await generateToken(data, {
                secret: config.secret,
                expiresIn: config.ttl,
                audience: config.name,
                issuer: config.issuer,
            })

            return cookie(res, token, config).status(200).json(data)
        } catch (error) {
            return res.status(400).json({ error: 'Invalid input format' })
        }
    })

    return router
}

