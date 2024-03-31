export interface AiClient {
    query(content: string): Promise<string>;
}