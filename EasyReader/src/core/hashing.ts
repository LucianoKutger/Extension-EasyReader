import { createHash } from 'crypto'

export function testToHash(text: string): string {
    return createHash('sha256').update(text).digest('hex')
}

