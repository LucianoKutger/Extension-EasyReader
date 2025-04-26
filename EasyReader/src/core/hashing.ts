import {createHash} from 'crypto'

function hashString(text: string): string{
    return createHash('sha256').update(text).digest('hex')
}

