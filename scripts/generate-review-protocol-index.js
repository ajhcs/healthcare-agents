#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { reviewProtocolIndex } = require('../lib/review-protocols');

const target = path.join(__dirname, '..', 'review-protocols', 'index.json');
fs.writeFileSync(target, JSON.stringify(reviewProtocolIndex(), null, 2) + '\n');
console.log(target);
