/**
 * PM2 config
 */

module.exports = {
    apps : [
        {
            name   : "client",
            script : "./build/client.js"
        },
        {
            name   : "service",
            script : "./build/service.js",
            instances: 2,
            exec_mode: 'cluster',
        }
    ]
}