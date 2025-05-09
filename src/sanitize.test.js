import { validateInput, sanitizeInput } from './sanitize.js'

describe('validateInput', () => {
  it('should return true for valid input', () => {
    const pattern = /^[A-Za-z0-9-_=.]+$/
    expect(validateInput('validInput123', pattern)).toBe(true)
    expect(validateInput('valid-input_123', pattern)).toBe(true)
    expect(validateInput('valid.input=123', pattern)).toBe(true)
  })

  it('should return false for invalid input', () => {
    const pattern = /^[A-Za-z0-9-_=.]+$/
    expect(validateInput('invalid input with spaces', pattern)).toBe(false)
    expect(validateInput('invalid$input#with@special!chars', pattern)).toBe(false)
    expect(validateInput(null, pattern)).toBe(false)
    expect(validateInput(undefined, pattern)).toBe(false)
  })
})

describe('sanitizeInput', () => {
  it('should return the input if it matches the pattern', () => {
    const pattern = /^[A-Za-z0-9-_=.]+$/
    expect(sanitizeInput('validInput123', pattern)).toBe('validInput123')
    expect(sanitizeInput('valid-input_123', pattern)).toBe('valid-input_123')
    expect(sanitizeInput('valid.input=123', pattern)).toBe('valid.input=123')
  })

  it('should throw an error if input does not match the pattern', () => {
    const pattern = /^[A-Za-z0-9-_=.]+$/
    expect(() => sanitizeInput('invalid input with spaces', pattern)).toThrow('Invalid input format')
    expect(() => sanitizeInput('invalid$input#with@special!chars', pattern)).toThrow('Invalid input format')
    expect(() => sanitizeInput(null, pattern)).toThrow('Invalid input format')
    expect(() => sanitizeInput(undefined, pattern)).toThrow('Invalid input format')
  })
})
