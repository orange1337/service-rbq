/**
 * Client
 */
import amqplib from 'amqplib';

import * as dotenv from 'dotenv';
dotenv.config();

const RBQ_USER = process.env?.RBQ_USER || 'user';
const RBQ_PASS = process.env?.RBQ_PASS || 'yourpassword';

import { Commands, TaskData, TaskResult } from './interfaces';
import { toBufferJson, fromBufferJson, Logger } from './utils';

const logger = new Logger('CLIENT');

(async () => {
    try {
        await Init();
    } catch (err) {
        logger.log(err);
    }
})();

async function Init(): Promise<void> {
    const conn = await amqplib.connect(`amqp://${RBQ_USER}:${RBQ_PASS}@localhost:5672`);
  
    const tasksQueue = 'tasks';
    const ch1 = await conn.createChannel();
    await ch1.assertQueue(tasksQueue, { durable: true });

    const resultsQueue = 'results';
    const ch2 = await conn.createChannel();
    await ch2.assertQueue(resultsQueue, { durable: true });

    const taskData: TaskData = {
        taskId: '1234',
        command: Commands.checkApproved,
        payload: 'some memo'
    };

    ch1.sendToQueue(tasksQueue, toBufferJson(taskData), {
        persistent: true
    });

    ch2.consume(resultsQueue, (msg) => {
        if (msg === null) {
            return logger.log('Null message');
        }
        const message: TaskResult = fromBufferJson(msg);
        if (message.error) {
            return logger.log(
                `${message.command} for task ${message.taskId} - finished with error, ${message.error}`
            );
        }
        logger.log(`Result: [${message.command}, ${message.taskId}]:`, message.result);

        const taskData: TaskData = {
            taskId: message.taskId,
            command: Commands.getBalance,
            payload: 'address',
        };
        let finished = 0;

        switch (message.command) {
            case Commands.checkApproved: {
                if (!message.result) {
                    taskData.command = Commands.approve;
                    taskData.payload = '123';
                }
                break;
            }
            case Commands.approve: {
                break;
            }
            case Commands.getBalance: {
                if (!message.result) {
                    taskData.command = Commands.feed;
                    taskData.payload = 'address, 5 - balance';
                    break;
                }

                taskData.command = Commands.sign;
                taskData.payload = '';
                break;
            }
            case Commands.feed: {
                taskData.command = Commands.sign;
                taskData.payload = '';
                break;
            }
            case Commands.sign: {
                taskData.command = Commands.send;
                taskData.payload = '123, address, signature';
                break;
            }

            default: {
                finished = 1;
                if (message.command === Commands.send) {
                    let msgLog = `${message.command} for task ${message.taskId} - tx Sent successfully`;
                    if (!message.result) {
                        msgLog = `${message.command} for task ${message.taskId} - tx didn't send`;
                    }
                    logger.log(msgLog);
                } else {
                    logger.log(
                        `${message.command} for task ${message.taskId} - not found in list`
                    );
                }
            }
        }

        if (!finished) {
            ch1.sendToQueue(tasksQueue, toBufferJson(taskData), {
                persistent: true
            });
        }
        ch2.ack(msg);
    }, {
        noAck: false,
    });
}
