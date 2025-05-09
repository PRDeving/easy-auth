import defaultConfig from './defaultConfig.js'

import { generateToken, verifyToken } from './token.js'
import { generateAuthphrase } from './auth.js'
import cookie from './cookie.js'
import { sanitizeString, sanitizeObject } from './sanitize.js'

import Middleware from './middleware.js'
import Router from './router.js'

const EasyAuth = (_config) => {
    const config = { ...defaultConfig, ..._config, ...process.env }

    return ({
        generateAuthphrase: (identifier, password) => generateAuthphrase(
            sanitizeString(identifier), 
            sanitizeString(password), 
            config.secret
        ),
        validateSession: async (token) => verifyToken(token, config),
        SessionMiddleware: Middleware(config),
        Router: Router(config),

        Create: async (identifier, password, data) => {
            const sanitizedIdentifier = sanitizeString(identifier)
            const sanitizedPassword = sanitizeString(password)
            const sanitizedData = sanitizeObject(data)
            
            const authphrase = generateAuthphrase(sanitizedIdentifier, sanitizedPassword, config.secret)
            const exists = await config.onAuth(authphrase)
            if (!!exists) return false

            return config.onCreate(authphrase, sanitizedData)
        },

        Auth: async (identifier, password) => {
            const sanitizedIdentifier = sanitizeString(identifier)
            const sanitizedPassword = sanitizeString(password)
            
            const authphrase = generateAuthphrase(sanitizedIdentifier, sanitizedPassword, config.secret)
            const data = await config.onAuth(authphrase)
            if (!data) return false

            return data
        },

        Session: async (data) => {
            const token = await generateToken(data, {
                secret: config.secret,
                expiresIn: config.ttl,
                audience: config.name,
                issuer: config.issuer,
            })

            return {
                data,
                token,
                session: (res) => cookie(res, token, config),
            }
        }
    })
}
export default EasyAuth
