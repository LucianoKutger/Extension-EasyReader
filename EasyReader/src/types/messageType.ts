export type runtimeMessage = {
    action: string
    mode: string
    targetId?: string
    text?: string
}

export type tabOnMessage = {
    action: string
    mode: string
    parentId: string
    targetId?: string
    text?: string
}

export type tabSendMessage = {
    action: string
    mode: string
    text?: string
}
