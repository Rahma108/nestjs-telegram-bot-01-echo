import { Types } from "mongoose";

export interface ITask {
    
    userId: Types.ObjectId;
    title: string;
    completed: boolean;

   priority?: string;
    dueDate?: Date;
    deletedAt?:Date ;
    restoredAt?:Date;


}