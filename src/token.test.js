import { verifyToken, generateToken } from './token.js'
import { sanitizeObject, sanitizeToken } from './sanitize.js'

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

jest.mock('./sanitize.js', () => ({
  sanitizeObject: jest.fn(data => data),
  sanitizeToken: jest.fn(token => token),
}))

import jwt from 'jsonwebtoken'

describe('generateToken', () => {
  it('Should hash and sanitize data', async () => {
    jwt.sign.mockImplementationOnce(() => 'token')
    sanitizeObject.mockReturnValueOnce({ userId: 1 })

    const token = await generateToken({ userId: 1 }, { secret: 'secret', expiresIn: '1d' })

    expect(sanitizeObject).toHaveBeenCalledWith({ userId: 1 })
    expect(jwt.sign).toHaveBeenCalled()
    expect(token).toEqual('token')
  })
})

describe('verifyToken', () => {
  it('Should sanitize, verify and return', async () => {
    const mockDecoded = { userId: 1 }
    jwt.verify.mockImplementationOnce((token, secret, options, callback) => callback(null, mockDecoded))
    sanitizeToken.mockReturnValueOnce('sanitized-token')

    const decoded = await verifyToken('token', { 
      secret: 'secret',
      sanitization: {
        enabled: true,
        sanitizeTokens: true
      }
    })

    expect(sanitizeToken).toHaveBeenCalledWith('token')
    expect(jwt.verify).toHaveBeenCalledWith('sanitized-token', 'secret', expect.any(Object), expect.any(Function))
    expect(decoded).toEqual(mockDecoded)
  })

  it('Should return error if invalid token format', async () => {
    sanitizeToken.mockReturnValueOnce(null)

    await expect(verifyToken('invalid-token', { 
      secret: 'secret',
      sanitization: {
        enabled: true,
        sanitizeTokens: true
      }
    })).rejects.toThrow('Invalid token format')
  })

  it('Should return error if jwt verification fails', async () => {
    const mockError = new Error('invalid')
    jwt.verify.mockImplementationOnce((token, secret, options, callback) => callback(mockError, null))
    sanitizeToken.mockReturnValueOnce('sanitized-token')

    await expect(verifyToken('token', { secret: 'secret' })).rejects.toThrow('invalid')
  })
})
