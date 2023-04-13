/**
 * Client
 */
import amqplib from 'amqplib';

import * as dotenv from 'dotenv';
dotenv.config();

const RBQ_USER = process.env?.RBQ_USER || 'user';
const RBQ_PASS = process.env?.RBQ_PASS || 'yourpassword';

(async () => {
    try {
        await Init();
    } catch (err) {
        console.error(err);
    }
})();

async function Init(): Promise<void> {
    const queue = 'tasks';
    const conn = await amqplib.connect(`amqp://${RBQ_USER}:${RBQ_PASS}@localhost:5672`);
        
    const ch1 = await conn.createChannel();
    await ch1.assertQueue(queue, { durable: true });

    const taskData = {
        command: 'checkApproved',
        taskId: '1234',
        payload: 'some memo'
    };

    ch1.sendToQueue(queue, Buffer.from('msg from client'), {
        persistent: true
    });
    
    // ch2.consume(queue, (msg) => {
    //     if (msg !== null) {
    //         console.log('Recieved:', msg.content.toString());
    //         ch1.ack(msg);
    //     } else {
    //         console.log('Consumer cancelled by server');
    //     }
    // });
}