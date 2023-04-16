"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.getRandom = exports.fromBufferJson = exports.toBufferJson = void 0;
/**
 * Utils
 */
function toBufferJson(msg) {
    let str = '';
    try {
        str = JSON.stringify(msg);
    }
    catch (err) {
        console.error(err);
    }
    return Buffer.from(str);
}
exports.toBufferJson = toBufferJson;
function fromBufferJson(msg) {
    let obj;
    try {
        obj = JSON.parse(msg.content.toString());
    }
    catch (err) {
        console.error(err);
    }
    return obj;
}
exports.fromBufferJson = fromBufferJson;
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.getRandom = getRandom;
class Logger {
    constructor(name) {
        this.name = `${name}_${process.env.NODE_APP_INSTANCE || 0}`;
    }
    log(...args) {
        console.log(this.name, ...args);
    }
}
exports.Logger = Logger;
