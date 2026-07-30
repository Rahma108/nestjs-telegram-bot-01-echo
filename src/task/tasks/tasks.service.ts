import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { TaskRepository } from 'src/common/repository/task.repository';

@Injectable()
export class TasksService {
    constructor(
    private readonly taskRepository: TaskRepository,
    ) {}
        async createTask(
        userId: Types.ObjectId,
        title: string,
        ) {
        return this.taskRepository.createOne({
            data: {
            userId,
            title,
            },
        });
        }

     // 1 - Add Task ..
        async addTask(
            userId: Types.ObjectId,
            title: string,
            dueDate?: Date,
            priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
            ) {
            return this.taskRepository.createOne({
                data: {
                userId,
                title,
                dueDate,
                priority,
                completed: false,
                },
            });
            }
    // Get Task 
    async getTasks(
    userId: Types.ObjectId,
    page = 1,
    limit = 5,
    ) {
    const skip = (page - 1) * limit;

    const tasks = await this.taskRepository.find({
        filter: {
        userId,
        },
        options: {
        skip,
        limit,
        sort: {
            createdAt: -1,
        },
        },
    });

    const total = await this.taskRepository.countDocuments({
        userId,
    });

    return {
        tasks,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
    }
        
            // Complete Task
            async completeTask(taskId: Types.ObjectId) {
            return this.taskRepository.findOneAndUpdate({
                filter: {
                _id: taskId,
                },
                update: {
                completed: true,
                },
            });
            }
        // Delete Task .
                async deleteTask(taskId: Types.ObjectId) {
                return this.taskRepository.findOneAndUpdate({
                    filter: {
                    _id: taskId,
                    },
                    update: {
                    deletedAt: new Date(),
                    restoredAt: null,
                    },
                });
                }
        async restoreTask(taskId: Types.ObjectId) {
            return this.taskRepository.findOneAndUpdate({
                filter: {
                _id: taskId,
                },
                update: {
                deletedAt: null,
                restoredAt: new Date(),
                },
            });
            }

                //  Toggle
            async toggleTask(taskId: Types.ObjectId) {
                const task = await this.taskRepository.findById({
                    _id: taskId,
                });

                if (!task) {
                    return null;
                }

                return this.taskRepository.findOneAndUpdate({
                    filter: {
                    _id: taskId,
                    },
                    update: {
                    completed: !task.completed
                    },
                });
                }
            // trash
            async getDeletedTasks(userId: Types.ObjectId) {
                return this.taskRepository.find({
                    filter: {
                    userId,
                    deletedAt: { $ne: null },
                    paranoid: false as any,
                    },
                });
                }

            // hard delete
                    async deleteForever(taskId: Types.ObjectId) {
                    return this.taskRepository.findByIdAndDelete({
                        _id: taskId,
                    });
                    }

                    async searchTasks(
                            userId: Types.ObjectId,
                            keyword: string,
                            ) {
                            return this.taskRepository.find({
                                filter: {
                                userId,
                                title: {
                                    $regex: keyword,
                                    $options: 'i',
                                },
                                },
                            });
                            }

                async editTask(
                    taskId: Types.ObjectId,
                    title: string,
                    ) {
                    return this.taskRepository.findOneAndUpdate({
                        filter: {
                        _id: taskId,
                        },
                        update: {
                        title,
                        },
                    });
                    }
                async getCompletedTasks(
        telegramId: Types.ObjectId,
        ) {
        return this.taskRepository.find({
            filter: {
            telegramId,
            completed: true,
            },
        });
        }

        async getPendingTasks(
        telegramId: Types.ObjectId,
        ) {
        return this.taskRepository.find({
            filter: {
            telegramId,
            completed: false,
            },
        });
        }

        async getAllTasks(
        telegramId: Types.ObjectId,
        ) {
        return this.taskRepository.find({
            filter: {
            telegramId,
            },
        });
        }   
        async getStatistics(userId: Types.ObjectId) {
        const total = await this.taskRepository.countDocuments({
            userId,
        });

        const completed =
            await this.taskRepository.countDocuments({
            userId,
            completed: true,
            });

        const pending =
            await this.taskRepository.countDocuments({
            userId,
            completed: false,
            });

        const deleted =
            await this.taskRepository.countDocuments({
            userId,
            deletedAt: { $ne: null },
            paranoid: false as any,
            });

        return {
            total,
            completed,
            pending,
            deleted,
        };
        }





    }
