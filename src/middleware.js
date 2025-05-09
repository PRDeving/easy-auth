import { generateToken, verifyToken } from './token.js'
import cookie from './cookie.js'
import { sanitizeInput } from './sanitize.js'

export default (config) => async (req, res, next) => {
    const tokenStr = req.cookies?.eat || req.headers.authorization
    if (!tokenStr) return next()
    
    try {
        const sanitizedTokenStr = sanitizeInput(tokenStr, config.inputPattern)
        const token = (sanitizedTokenStr.startsWith('Bearer')) 
            ? sanitizeInput(sanitizedTokenStr.split(' ')[1], config.inputPattern) 
            : sanitizedTokenStr

        const decoded = await verifyToken(token, config)
        const now = Date.now() / 1000;
        const timeSinceIssued = now - decoded.iat;

        if (timeSinceIssued > config.refresh && timeSinceIssued < config.ttl) {
            const fresh = await generateToken(decoded, {
                secret: config.secret,
                expiresIn: config.ttl,
                audience: config.audience,
                issuer: config.issuer,
            })

            cookie(res, fresh, config)
        }

        const { exp, iss, aud, iat, ...rest } = decoded
        req.session = rest
    } catch(error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    next()
}
