import defaultConfig from './defaultConfig.js'

import { generateToken, verifyToken } from './token.js'
import { generateAuthphrase } from './auth.js'
import cookie from './cookie.js'
import { sanitizeInput } from './sanitize.js'

import Middleware from './middleware.js'
import Router from './router.js'

const EasyAuth = (_config) => {
    const config = { ...defaultConfig, ..._config, ...process.env }

    return ({
        generateAuthphrase: (identifier, password) => {
            try {
                const sanitizedIdentifier = sanitizeInput(identifier, config.inputPattern)
                const sanitizedPassword = sanitizeInput(password, config.inputPattern)
                return generateAuthphrase(sanitizedIdentifier, sanitizedPassword, config.secret)
            } catch (error) {
                throw new Error('Invalid input format')
            }
        },
        validateSession: async (token) => {
            try {
                const sanitizedToken = sanitizeInput(token, config.inputPattern)
                return verifyToken(sanitizedToken, config)
            } catch (error) {
                return false
            }
        },
        SessionMiddleware: Middleware(config),
        Router: Router(config),

        Create: async (identifier, password, data) => {
            try {
                const sanitizedIdentifier = sanitizeInput(identifier, config.inputPattern)
                const sanitizedPassword = sanitizeInput(password, config.inputPattern)
                
                const authphrase = generateAuthphrase(sanitizedIdentifier, sanitizedPassword, config.secret)
                const exists = await config.onAuth(authphrase)
                if (!!exists) return false

                return config.onCreate(authphrase, data)
            } catch (error) {
                return false
            }
        },

        Auth: async (identifier, password) => {
            try {
                const sanitizedIdentifier = sanitizeInput(identifier, config.inputPattern)
                const sanitizedPassword = sanitizeInput(password, config.inputPattern)
                
                const authphrase = generateAuthphrase(sanitizedIdentifier, sanitizedPassword, config.secret)
                const data = await config.onAuth(authphrase)
                if (!data) return false

                return data
            } catch (error) {
                return false
            }
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
