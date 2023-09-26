import jwt from 'jsonwebtoken'

export const generateToken = (data, config) => new Promise((res) => res(jwt.sign(data, config.secret, {
    expiresIn: config.expiresIn,
    audience: config.audience,
    issuer: config.issuer,
})))

export const verifyToken = (token, config) => new Promise((res) => {
    jwt.verify(token, config.secret,{
        audience: config.audience,
        issuer: config.issuer,
    }, (err, decoded) => {
        if (err) return res(null)
        delete decoded['iat']
        delete decoded['exp']
        delete decoded['aud']
        delete decoded['iss']
        return res(decoded)
    })
})
