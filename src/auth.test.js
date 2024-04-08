import { sha256, generateAuthphrase } from './auth.js'

describe('Auth', () => {
    test('sha256 should hash compliantly', () => {
        expect(sha256('SECRET')).toBe('0917b13a9091915d54b6336f45909539cce452b3661b21f386418a257883b30a')
    });

    test('Authphrase should match', () => {
        expect(generateAuthphrase('username', 'password', 'SECRET')).toBe('4d0937874a8c741ec07a1e3ab465d94b3618c544dfd9d002b8448f5c894ca575')
    });

    test('Authphrase should hash differently if the secret is changed', () => {
        expect(generateAuthphrase('username', 'password', 'TEST')).not.toBe('4d0937874a8c741ec07a1e3ab465d94b3618c544dfd9d002b8448f5c894ca575')
    });

    test('Authphrase should return even if no parameters are provided', () => {
        expect(generateAuthphrase()).toEqual(expect.any(String))
    });
})
