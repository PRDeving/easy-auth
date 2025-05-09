import express from 'express'
import request from 'supertest'

import authRouter from './router.js'
import { generateToken, verifyToken, generateAuthphrase } from './token.js'
import { sanitizeInput } from './sanitize.js'

jest.mock('./token.js', () => ({
    generateToken: jest.fn(),
    generateAuthphrase: jest.fn(),
}))

jest.mock('./sanitize.js', () => ({
    sanitizeInput: jest.fn(input => input),
}))

it('debe responder con un token para una autenticación exitosa', async () => {
    const app = express()
    app.use(express.json())
    app.use(authRouter({
        secret: 'testSecret',
        ttl: 3600,
        name: 'testApp',
        issuer: 'testIssuer',
        onAuth: async () => ({ userId: 1 })
    }))

    generateAuthphrase.mockReturnValue('authPhraseMock')
    generateToken.mockResolvedValue('tokenMock')

    const response = await request(app).post('/auth').send({
        identifier: 'user',
        password: 'password'
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ userId: 1 })
    expect(generateToken).toHaveBeenCalledWith({ userId: 1 }, expect.any(Object))
    expect(response.headers['set-cookie']).toBeDefined()
})

it('debe responder con 401 para autenticación fallida', async () => {
    const app = express()
    app.use(express.json())
    app.use(authRouter({
        secret: 'testSecret',
        ttl: 3600,
        name: 'testApp',
        issuer: 'testIssuer',
        onAuth: async () => null
    }))

    const response = await request(app).post('/auth').send({
        identifier: 'user',
        password: 'wrongpassword'
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ error: 'Invalid token' })
})

it('debe responder con un token y un estado 200 para una creación exitosa', async () => {
    const app = express()
    app.use(express.json())
    app.use(authRouter({
        secret: 'testSecret',
        ttl: 3600,
        name: 'testApp',
        issuer: 'testIssuer',
        onAuth: async (authphrase) => {
            expect(authphrase).toBe('75d02b64f9f041f23fe1a31bca51bb0884aebf410f82966a2ca3d171b3e77e77')
            return ({ userId: 1 })
        },
        onCreate: async () => true,
    }))

  const response = await request(app).post('/create').send({
      identifier: 'user',
      password: 'pass',
  })

  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('userId')
  expect(response.headers['set-cookie']).toBeDefined()
})

it('debe responder con 400 si onCreate falla', async () => {
    const app = express()
    app.use(express.json())
    app.use(authRouter({
        secret: 'testSecret',
        ttl: 3600,
        name: 'testApp',
        issuer: 'testIssuer',
        onAuth: async () => null,
        onCreate: async () => null,
  }))

  const response = await request(app).post('/create').send({
      identifier: 'user',
      password: 'pass',
  })

  expect(response.statusCode).toBe(400)
  expect(response.body).toEqual({ error: 'Invalid request' })
})

it('debe responder con 400 si onCreate falla', async () => {
    const app = express()
    app.use(express.json())
    app.use(authRouter({
        secret: 'testSecret',
        ttl: 3600,
        name: 'testApp',
        issuer: 'testIssuer',
        onAuth: async () => null,
        onCreate: async () => false,
  }))

  const response = await request(app).post('/create').send({
      identifier: 'user',
      password: 'pass',
  })

  expect(response.statusCode).toBe(400)
  expect(response.body).toEqual({ error: 'Invalid request' })
})

it('debe responder con 500 si onAuth falla', async () => {
    const app = express()
    app.use(express.json())
    app.use(authRouter({
        secret: 'testSecret',
        ttl: 3600,
        name: 'testApp',
        issuer: 'testIssuer',
        onAuth: async () => null,
        onCreate: async () => true,
  }))

  const response = await request(app).post('/create').send({
      identifier: 'user',
      password: 'pass',
  })

  expect(response.statusCode).toBe(500)
  expect(response.body).toEqual({ error: 'Cant create' })
})
