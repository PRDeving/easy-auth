import { generateToken, verifyToken } from './token.js'
import { generateAuthphrase } from './auth.js'

const EasyAuth = (config) => ({
    validateSession: async (token) => verifyToken(token, config),
    SessionMiddleware: async (req, res, next) => {
        const tokenStr = req.cookies?.eat || req.headers.authorization
        if (!tokenStr) return next()
        const token = (tokenStr.startsWith('Bearer')) ? tokenStr.split(' ')[1] : tokenStr

        req.session = await verifyToken(token, config)

        const fresh = await generateToken(req.session, {
            secret: config.secret,
            expiresIn: config.ttl || 1000 * 60 * 60 * 24,
            audience: config.name || 'easy-auth',
            issuer: 'easy-auth',
        })

        res.cookie('eat', fresh, {
            maxAge: config.ttl || 1000 * 60 * 60 * 24,
            httpOnly: true,
        })
        next()
    },

    credentialsAuth: async (identifier, password) => {
        const authphrase = generateAuthphrase(identifier, password, config.secret)
        const data = await config.onAuth(authphrase)
        if (!data) return null

        const token = await generateToken(data, {
            secret: config.secret,
            expiresIn: config.ttl || 1000 * 60 * 60 * 24,
            audience: config.name || 'easy-auth',
            issuer: 'easy-auth',
        })

        return {
            data,
            token,
            session: (res) => res?.cookie('eat', token, {
                maxAge: config.ttl || 1000 * 60 * 60 * 24,
                httpOnly: true,
            }),
        }
    }
})
export default EasyAuth
