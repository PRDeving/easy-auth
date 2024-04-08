import jwt from 'jsonwebtoken'

export const generateToken = (data, config) => new Promise((res) => res(jwt.sign(data, config.secret, {
    expiresIn: config.ttl,
    audience: config.audience,
    issuer: config.issuer,
})))

export const verifyToken = (token, config) => new Promise((res, rej) => {
    jwt.verify(token, config.secret,{
        audience: config.audience,
        issuer: config.issuer,
    }, (err, decoded) => {
        if (err) return rej(err)
        return res(decoded)
    })
})
