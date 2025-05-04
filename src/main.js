import defaultConfig from './defaultConfig.js'

import { generateToken, verifyToken } from './token.js'
import { generateAuthphrase } from './auth.js'
import cookie from './cookie.js'

import Middleware from './middleware.js'
import Router from './router.js'

const EasyAuth = (_config) => {
    const config = { ...defaultConfig, ..._config, ...process.env }

    return ({
        generateAuthphrase: (identifier, password) => generateAuthphrase(identifier, password, config.secret),
        validateSession: async (token) => verifyToken(token, config),
        SessionMiddleware: Middleware(config),
        Router: Router(config),

        Create: async (identifier, password, data) => {
            const authphrase = generateAuthphrase(identifier, password, config.secret)
            const exists = await config.onAuth(authphrase)
            if (!!exists) return false

            return config.onCreate(authphrase, data)
        },

        Auth: async (identifier, password) => {
            const authphrase = generateAuthphrase(identifier, password, config.secret)
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
