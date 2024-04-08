import { generateToken, verifyToken } from './token.js'
import cookie from './cookie.js'

export default (config) => async (req, res, next) => {
    const tokenStr = req.cookies?.eat || req.headers.authorization
    if (!tokenStr) return next()
    const token = (tokenStr.startsWith('Bearer')) ? tokenStr.split(' ')[1] : tokenStr

    try {
        const decoded = await verifyToken(token, config)
        const now = Date.now() / 1000;
        const timeSinceIssued = now - decoded.iat;

        if (timeSinceIssued > config.refresh && timeSinceIssued < config.ttl) {
            const fresh = await generateToken(req.session, {
                secret: config.secret,
                expiresIn: config.ttl,
                audience: config.audience,
                issuer: config.issuer,
            })

            cookie(res, fresh, config)
        }

        req.session = decoded
    } catch(error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    next()
}
