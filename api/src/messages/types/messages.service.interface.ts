export interface MessagesServiceInterface {
	processMessage: (dto: { text: string }) => Promise<string>;
}
