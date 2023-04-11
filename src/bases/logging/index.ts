import type {Logger} from './Logger';
import {createLogger} from './Logger';

let log = createLogger({level: 'trace'});

const setLogger = (l: Logger) => {
  log = l;
};

export {log, setLogger, createLogger};
