import {createHash} from 'crypto'

export function hashString(text: string): string{
    return createHash('sha256').update(text).digest('hex')
}

