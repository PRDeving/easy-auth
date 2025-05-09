import authMiddleware from './middleware.js'
import { generateToken, verifyToken } from './token.js'
import cookie from './cookie.js'
import { sanitizeToken } from './sanitize.js'

jest.mock('./token.js', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}))

jest.mock('./cookie.js', () => jest.fn())

jest.mock('./sanitize.js', () => ({
  sanitizeToken: jest.fn(token => token),
}))

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext
  beforeEach(() => {
    mockReq = { cookies: {}, headers: {} }
    mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  it('should continue but not set session if no token is provided', async () => {
    await authMiddleware({})(mockReq, mockRes, mockNext)
    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.session).not.toBeTruthy()
  })

  it('should verify and set req.session if token as bearer is valid', async () => {
    const decoded = { iat: Math.floor(Date.now() / 1000) - 100, userId: 1 }
    verifyToken.mockResolvedValue(decoded)
    sanitizeToken.mockReturnValue('validToken')

    mockReq.headers.authorization = 'Bearer validToken'

    const config = { secret: 'secret', ttl: 3600, refresh: 300, name: 'testApp', issuer: 'issuer' }

    await authMiddleware(config)(mockReq, mockRes, mockNext)

    expect(sanitizeToken).toHaveBeenCalledWith('validToken')
    expect(verifyToken).toHaveBeenCalledWith('validToken', config)
    expect(mockReq.session).toEqual({ userId: 1 })
    expect(mockNext).toHaveBeenCalled()
  })


  it('should berify and set req.session if token as cookie is valid', async () => {
    const decoded = { iat: Math.floor(Date.now() / 1000) - 100, userId: 1 }
    verifyToken.mockResolvedValue(decoded)

    mockReq.cookies.eat = 'validToken'

    const config = { secret: 'secret', ttl: 3600, refresh: 300, name: 'testApp', issuer: 'issuer' }

    await authMiddleware(config)(mockReq, mockRes, mockNext)

    expect(verifyToken).toHaveBeenCalledWith('validToken', config)
    expect(mockReq.session).toEqual({ userId: 1 })
    expect(mockNext).toHaveBeenCalled()
  })

  it('should refresh the token if near to expiration', async () => {
    const decoded = { iat: Math.floor(Date.now() / 1000) - 350, userId: 1 }
    verifyToken.mockResolvedValue(decoded)
    generateToken.mockResolvedValue('freshToken')

    mockReq.headers.authorization = 'Bearer tokenNearExpiry'

    const config = { secret: 'secret', ttl: 3600, refresh: 300, audience: 'testApp', issuer: 'issuer' }

    await authMiddleware(config)(mockReq, mockRes, mockNext)

    expect(generateToken).toHaveBeenCalledWith(decoded, {
        secret: config.secret,
        expiresIn: config.ttl,
        audience: config.audience,
        issuer: config.issuer,
    })
    expect(cookie).toHaveBeenCalledWith(mockRes, 'freshToken', config)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    verifyToken.mockRejectedValue(new Error('Invalid token'))

    mockReq.headers.authorization = 'Bearer invalidToken'

    const config = { secret: 'secret', ttl: 3600, refresh: 300, name: 'testApp', issuer: 'issuer' }

    await authMiddleware(config)(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' })
  })
})
