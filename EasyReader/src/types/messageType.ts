export type runtimeMessage = {
    action: string
    mode: string
    parentId?: string
    targetId?: string
    text?: string
    error?: string
    originalText?: string
    tableTag?: string
    parentElement?: string
    tableId: string
}

export type tabOnMessage = {
    action: string
    mode: string
    parentId?: string
    targetId?: string
    text?: string
    error?: string
    originalText?: string
    tableTag?: string
    parentElement?: string
    tableId: string
}

export type tabSendMessage = {
    action: string
    mode: string
    text?: string
}
