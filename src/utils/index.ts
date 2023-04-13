/**
 * Utils
 */
export function toBufferJson(msg: any): Buffer {
    let str = '';
    try {
        str = JSON.stringify(msg);
    } catch(err) {
        console.error(err);
    }
    return Buffer.from(str);
}

export function fromBufferJson(msg: any): any {
    let obj: any;
    try {
        obj = JSON.parse(msg.content.toString());
    } catch(err) {
        console.error(err);
    }
    return obj;
}

export function getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export class Logger {
    name: string;

    constructor(name: string) {
        this.name = `${name}_${process.env.NODE_APP_INSTANCE || 0}`;
    }

    log(...args: any[]): void {
        console.log(this.name, ...args);
    }
}