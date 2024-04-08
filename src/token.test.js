import { verifyToken, generateToken } from './token.js'

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

import jwt from 'jsonwebtoken'

describe('generateToken', () => {
  it('Should hash', async () => {
    jwt.sign.mockImplementationOnce(() => 'token')

    const token = await generateToken({ userId: 1 }, { secret: 'secret', expiresIn: '1d' })

    expect(jwt.sign).toHaveBeenCalled()
    expect(token).toEqual('token')
  })
})

describe('verifyToken', () => {
  it('Should verify and return', async () => {
    const mockDecoded = { userId: 1 }
    jwt.verify.mockImplementationOnce((token, secret, options, callback) => callback(null, mockDecoded))

    const decoded = await verifyToken('token', { secret: 'secret' })

    expect(jwt.verify).toHaveBeenCalled()
    expect(decoded).toEqual(mockDecoded)
  })

  it('Should return error if invalid', async () => {
    const mockError = new Error('invalid')
    jwt.verify.mockImplementationOnce((token, secret, options, callback) => callback(mockError, null))

    await expect(verifyToken('token', { secret: 'secret' })).rejects.toThrow('invalid')
  })
})
