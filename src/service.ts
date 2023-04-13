/**
 * Service
 */
import amqplib from "amqplib";

import * as dotenv from 'dotenv';
dotenv.config();

const RBQ_USER = process.env?.RBQ_USER || 'user';
const RBQ_PASS = process.env?.RBQ_PASS || 'yourpassword';

import { TaskData, TaskResult } from './interfaces';
import { toBufferJson, fromBufferJson, Logger, getRandom } from './utils';

const logger = new Logger('SERVICE');

(async () => {
    try {
        await Init();
    } catch (err) {
        logger.log(err);
    }
})();

async function Init() {
    
    const conn = await amqplib.connect(`amqp://${RBQ_USER}:${RBQ_PASS}@localhost:5672`);
  
    const tasksQueue = 'tasks';
    const ch1 = await conn.createChannel();
    await ch1.assertQueue(tasksQueue, { durable: true });
    ch1.prefetch(1);

    const resultsQueue = 'results';
    const ch2 = await conn.createChannel();
    await ch2.assertQueue(resultsQueue, { durable: true });

    ch1.consume(tasksQueue, (msg) => {
        if (msg === null) {
            return logger.log('Null message');
        }
        const message: TaskData = fromBufferJson(msg);

        setTimeout(() => {
            logger.log(`Processed: [${message.command}, ${message.taskId}]`);

            const resultData: TaskResult = {
                command: message.command,
                taskId: message.taskId,
                result: getRandom(0, 1),
                error: null,
            };
            ch2.sendToQueue(resultsQueue, toBufferJson(resultData), {
                persistent: true
            });

            ch1.ack(msg);
        }, getRandom(1000, 3000));
    }, {
        noAck: false
    });
}