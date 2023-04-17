/**
 * RabbitMQ service
 */
import amqplib from 'amqplib';

export class RbmqService {
    connection: amqplib.Connection | undefined;
    channel: amqplib.Channel | undefined;

    constructor(
        public connectionUrl: string,
    ) {}

    async connect(queues: string[]): Promise<amqplib.Channel> {
        this.connection = await amqplib.connect(this.connectionUrl);
        this.channel = await this.connection.createChannel();

        await this.assertQueues(queues);

        return this.channel;
    }

    async assertQueues(queues: string[]) {
        for (let i = 0; i < queues.length; i++) {
            await this.channel?.assertQueue(queues[i], { durable: true });
        }
    }

    async disconnect() {
        await this.channel?.close();
        await this.connection?.close();
    }
}