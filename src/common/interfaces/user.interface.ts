export interface IUser {
    telegramId: number;
    firstName: string;

    username: string;
    languageCode: string;

    deletedAt?:Date ;
    restoredAt?:Date;
}