/**
 * Service
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { RbmqService } from './rbmq.service';

const RBQ_USER = process.env?.RBQ_USER || 'user';
const RBQ_PASS = process.env?.RBQ_PASS || 'yourpassword';

import { Queues, TaskData, TaskResult } from './interfaces';
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
    const channel = await new RbmqService(
        `amqp://${RBQ_USER}:${RBQ_PASS}@localhost:5672`
    )
    .connect(Object.values(Queues));
    channel.prefetch(1)

    channel.consume(Queues.tasks, (msg) => {
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
            channel.sendToQueue(Queues.results, toBufferJson(resultData), {
                persistent: true
            });

            channel.ack(msg);
        }, getRandom(1000, 3000));
    }, {
        noAck: false
    });
}