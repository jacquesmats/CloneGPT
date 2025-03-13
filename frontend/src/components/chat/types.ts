export interface Message {
    id?: string;
    role: string;
    content: string;
    created_at?: string;
}

export interface Conversation {
    id: string;
    title: string;
    model: string;
    temperature: number;
    context_length: number;
    prompt?: string;
    created_at?: string;
    updated_at?: string;
    messages?: Message[];
}

export interface ChatSettings {
    model: string;
    temperature: number;
    contextLength: number;
}

export interface User {
    username: string;
}