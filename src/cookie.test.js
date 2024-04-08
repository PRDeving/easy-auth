const mockRes = {
  cookie: jest.fn(),
}

import cookie from './cookie.js'

describe('cookie', () => {
  it('should configure cookie with domain', () => {
    const mockRes = { cookie: jest.fn() }
    const value = 'tokenValue'
    const config = { ttl: 3600, domain: 'example.com' }

    cookie(mockRes, value, config)

    expect(mockRes.cookie).toHaveBeenCalledWith('eat', value, {
      maxAge: config.ttl * 1000,
      domain: config.domain,
      httpOnly: true,
    })
  })

  it('should configure cookie without domain', () => {
    const mockRes = { cookie: jest.fn() }
    const value = 'tokenValue'
    const config = { ttl: 3600 }

    cookie(mockRes, value, config)

    expect(mockRes.cookie).toHaveBeenCalledWith('eat', value, {
      maxAge: config.ttl * 1000,
      httpOnly: true,
    })
  })
})
