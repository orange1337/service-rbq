/**
 * Client business logic test
 */
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import amqplib from 'amqplib';
import { processClientResults } from '../src/client';

describe('Test Client (business logic)', () => {
    enum Queues {
        tasks = 'test_tasks',
        results = 'test_results'
    }
    let channel: SinonStubbedInstance<amqplib.Channel>;
    let sandbox: SinonSandbox;

    beforeAll(() => {
        sandbox = sinon.createSandbox();
    });

    afterAll(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        // channel = sinon.createStubInstance(amqplib.Channel);
        processClientResults(channel, Queues);
    });

    afterEach(async () => {
        // Purge the test queue
        await channel?.purgeQueue(Queues.tasks);
        await channel?.purgeQueue(Queues.results);
    });

    // test('adds 1 + 2 to equal 3', () => {
    //     expect(1 + 2).toBe(3);
    // });
});