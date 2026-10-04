const { parentPort, workerData } = require('worker_threads');
const { executeTool } = require('./admin-tools');
parentPort.postMessage(executeTool(workerData.name, workerData.args, workerData.allowAggregate));
