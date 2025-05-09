export default {
    name: 'easy-auth',
    domain: 'http://localhost',
    secret: 'MY_SECRET',
    audience: 'easy-auth',
    issuer: 'easy-auth',
    ttl: 60 * 60 * 24,
    refresh: 60,
    
    sanitization: {
        enabled: true,
        sanitizeRequestBody: true,
        sanitizeTokens: true,
        patterns: [
            { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, replacement: '' },
            { pattern: /<[^>]*on\w+\s*=\s*["']?[^"']*["']?[^>]*>/gi, replacement: '' },
            { pattern: /<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, replacement: '' },
            { pattern: /javascript\s*:/gi, replacement: 'removed:' },
            { pattern: /data\s*:/gi, replacement: 'removed:' }
        ]
    },

    onCreate: () => console.log('You need to configure a backend for user creation: fn(authphrase, data): boolean'),
    onAuth: () => console.log('You need to configure a backend for user auth: fn(authphrase): User'),
}
