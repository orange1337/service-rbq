/**
 * Interfaces
 */
export enum Queues {
    tasks = 'tasks',
    results = 'results',
}

export enum Commands {
    checkApproved = 'checkApproved',
    approve = 'approve',
    getBalance = 'getBalance',
    feed = 'feed',
    sign = 'sign',
    send = 'send',
};

export interface TaskData {
    command: Commands;
    taskId: string;
    payload: any;
}

export interface TaskResult {
    command: Commands;
    taskId: string;
    result: any;
    error: any;
}