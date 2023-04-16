/**
 * Client
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { RbmqService } from './rbmq.service';

const RBQ_USER = process.env?.RBQ_USER || 'user';
const RBQ_PASS = process.env?.RBQ_PASS || 'yourpassword';

import { Queues, Commands, TaskData, TaskResult } from './interfaces';
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
    const channel = await new RbmqService(
        `amqp://${RBQ_USER}:${RBQ_PASS}@localhost:5672`
    )
    .connect(Object.values(Queues));

    const taskData: TaskData = {
        taskId: '1234',
        command: Commands.checkApproved,
        payload: 'some memo'
    };

    channel.sendToQueue(Queues.tasks, toBufferJson(taskData), {
        persistent: true
    });

    channel.consume(Queues.results, (msg) => {
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
            channel.sendToQueue(Queues.tasks, toBufferJson(taskData), {
                persistent: true
            });
        }
        channel.ack(msg);
    }, {
        noAck: false,
    });
}
