export interface IChatRepository {
  addGroup(chatId: string, groupId: string): Promise<void>;

  removeGroup(chatId: string, groupId: string): Promise<void>;

  findGroupIds(chatId: string): Promise<string[]>;
}
