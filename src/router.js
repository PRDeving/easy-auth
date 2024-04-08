import { Router } from 'express'

import cookie from './cookie.js'
import { generateToken, verifyToken } from './token.js'
import { generateAuthphrase } from './auth.js'

export default (config) => {
    const router = Router()

    router.post('/create', async (req, res) => {
        const { identifier, password } = req.body
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
    })

    router.post('/auth', async (req, res) => {
        const { identifier, password } = req.body
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
    })

    return router
}

