/**
 * Service
 */
import amqplib from "amqplib";

import * as dotenv from 'dotenv';
dotenv.config();

const RBQ_USER = process.env?.RBQ_USER || 'user';
const RBQ_PASS = process.env?.RBQ_PASS || 'yourpassword';

const serviceInstance = `SERVICE_${process.env.NODE_APP_INSTANCE || 0}`;

(async () => {
    const queue = 'tasks';
    const conn = await amqplib.connect(`amqp://${RBQ_USER}:${RBQ_PASS}@localhost:5672`);
  
    const ch1 = await conn.createChannel();
    await ch1.assertQueue(queue, { durable: true });
    ch1.prefetch(1);

    ch1.consume(queue, (msg) => {
        if (msg == null) {
            return Logger('Consumer cancelled by server');
        }

        Logger(`Recieved: ${msg.content.toString()}`);
        setTimeout(() => {
            ch1.ack(msg);
        }, 1000);
    }, {
        noAck: false
    });
})();

function Logger(msg: any): void {
    console.error(serviceInstance, msg);
}