/*
 * Copyright 2023 TIS Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {ConsoleTransport} from './ConsoleTransport';
import type {LogFormatter, LogLevel} from './Logger';
import {createLogger, Logger} from './Logger';
import {SimpleLogFormatter} from './SimpleLogFormatter';

describe('createLogger', () => {
  test('ログオプションを指定しなかった場合の検証', () => {
    const log = createLogger();
    expect(log['level']).toEqual(1);
    expect(log['formatter']).toBeInstanceOf(SimpleLogFormatter);
    expect(log['transports']).toHaveLength(1);
    expect(log['transports'][0]).toBeInstanceOf(ConsoleTransport);
  });
  test('ログオプションを指定した場合の検証', () => {
    const formatter = new (class TestLogFormatter implements LogFormatter {
      format(level: LogLevel, message: string, errorCode?: string): string {
        return message;
      }
    })();
    const transports = [new ConsoleTransport()];
    const log = createLogger({level: 'info', formatter, transports});
    expect(log['level']).toEqual(1);
    expect(log['formatter']).toBe(formatter);
    expect(log['transports']).toBe(transports);
  });
});

describe('Logger constructor', () => {
  test('ログオプションを指定しなかった場合の検証', () => {
    const log = new Logger();
    expect(log['level']).toEqual(1);
    expect(log['formatter']).toBeInstanceOf(SimpleLogFormatter);
    expect(log['transports']).toHaveLength(1);
    expect(log['transports'][0]).toBeInstanceOf(ConsoleTransport);
  });
  test('ログオプションを指定した場合の検証', () => {
    const formatter = new (class TestLogFormatter implements LogFormatter {
      format(level: LogLevel, message: string, errorCode?: string): string {
        return message;
      }
    })();
    const transports = [new ConsoleTransport()];
    const log = new Logger({level: 'error', formatter, transports});
    expect(log['level']).toEqual(3);
    expect(log['formatter']).toBe(formatter);
    expect(log['transports']).toBe(transports);
  });
});

describe('Logger isLevelEnabled', () => {
  const transport = new ConsoleTransport();
  const mockTrace = jest.spyOn(transport, 'trace').mockImplementation();
  const mockDebug = jest.spyOn(transport, 'debug').mockImplementation();
  const mockInfo = jest.spyOn(transport, 'info').mockImplementation();
  const mockWarn = jest.spyOn(transport, 'warn').mockImplementation();
  const mockError = jest.spyOn(transport, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ログレベルをtraceにした場合の検証', () => {
    const log = new Logger({level: 'trace', transports: [transport]});
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(1);
    expect(mockDebug).toHaveBeenCalledTimes(1);
    expect(mockInfo).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  test('ログレベルをdebugにした場合の検証', () => {
    const log = new Logger({level: 'debug', transports: [transport]});
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(0);
    expect(mockDebug).toHaveBeenCalledTimes(1);
    expect(mockInfo).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  test('ログレベルをinfoにした場合の検証', () => {
    const log = new Logger({level: 'info', transports: [transport]});
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(0);
    expect(mockDebug).toHaveBeenCalledTimes(0);
    expect(mockInfo).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  test('ログレベルをwarnにした場合の検証', () => {
    const log = new Logger({level: 'warn', transports: [transport]});
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(0);
    expect(mockDebug).toHaveBeenCalledTimes(0);
    expect(mockInfo).toHaveBeenCalledTimes(0);
    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  test('ログレベルをerrorにした場合の検証', () => {
    const log = new Logger({level: 'error', transports: [transport]});
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(0);
    expect(mockDebug).toHaveBeenCalledTimes(0);
    expect(mockInfo).toHaveBeenCalledTimes(0);
    expect(mockWarn).toHaveBeenCalledTimes(0);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  test('ログレベルをmuteにした場合の検証', () => {
    const log = new Logger({level: 'mute', transports: [transport]});
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(0);
    expect(mockDebug).toHaveBeenCalledTimes(0);
    expect(mockInfo).toHaveBeenCalledTimes(0);
    expect(mockWarn).toHaveBeenCalledTimes(0);
    expect(mockError).toHaveBeenCalledTimes(0);
  });

  test('ログレベルを途中で変更した場合の検証', () => {
    // 最初はエラーレベルのみログ出力する
    const log = new Logger({level: 'error', transports: [transport]});
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(0);
    expect(mockDebug).toHaveBeenCalledTimes(0);
    expect(mockInfo).toHaveBeenCalledTimes(0);
    expect(mockWarn).toHaveBeenCalledTimes(0);
    expect(mockError).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();

    // 全てのレベルでログが出力されるように変更
    log.setLevel('trace');
    logAllMethod(log);
    expect(mockTrace).toHaveBeenCalledTimes(1);
    expect(mockDebug).toHaveBeenCalledTimes(1);
    expect(mockInfo).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  const logAllMethod = (log: Logger) => {
    log.trace('traceLog');
    log.debug('debugLog');
    log.info('infoLog');
    log.warn('warnLog');
    log.error(new Error('errorLog'), 'err0001');
  };
});

describe('Logger transport message and errorCode', () => {
  const formatter = new SimpleLogFormatter();
  const consoleTransport = new ConsoleTransport();
  const mockFormat = jest.spyOn(formatter, 'format');

  beforeAll(() => {
    jest.clearAllMocks();
  });

  test('traceレベルの場合にTransportにフォーマットされたメッセージを正しく渡しているかの検証', () => {
    const mockConsoleTrace = jest.spyOn(consoleTransport, 'trace').mockImplementation();
    const log = new Logger({level: 'trace', formatter, transports: [consoleTransport]});

    mockFormat.mockReturnValue('[trace] traceLog');
    log.trace('traceLog');
    expect(mockFormat).toHaveBeenCalledWith('trace', 'traceLog', undefined);
    expect(mockConsoleTrace).toHaveBeenCalledWith('[trace] traceLog');

    mockFormat.mockReturnValue('[trace] traceLogMessageSupplier');
    log.trace(() => 'traceLogMessageSupplier');
    expect(mockFormat).toHaveBeenCalledWith('trace', 'traceLogMessageSupplier', undefined);
    expect(mockConsoleTrace).toHaveBeenCalledWith('[trace] traceLogMessageSupplier');
  });

  test('debugレベルの場合にTransportにフォーマットされたメッセージを正しく渡しているかの検証', () => {
    const mockConsoleDebug = jest.spyOn(consoleTransport, 'debug').mockImplementation();
    const log = new Logger({level: 'debug', formatter, transports: [consoleTransport]});

    mockFormat.mockReturnValue('[debug] debugLog');
    log.debug('debugLog');
    expect(mockFormat).toHaveBeenCalledWith('debug', 'debugLog', undefined);
    expect(mockConsoleDebug).toHaveBeenCalledWith('[debug] debugLog');

    mockFormat.mockReturnValue('[debug] debugLogMessageSupplier');
    log.debug(() => 'debugLogMessageSupplier');
    expect(mockFormat).toHaveBeenCalledWith('debug', 'debugLogMessageSupplier', undefined);
    expect(mockConsoleDebug).toHaveBeenCalledWith('[debug] debugLogMessageSupplier');
  });

  test('infoレベルの場合にTransportにフォーマットされたメッセージを正しく渡しているかの検証', () => {
    const mockConsoleInfo = jest.spyOn(consoleTransport, 'info').mockImplementation();
    const log = new Logger({level: 'info', formatter, transports: [consoleTransport]});

    mockFormat.mockReturnValue('[info] infoLog');
    log.info('infoLog');
    expect(mockFormat).toHaveBeenCalledWith('info', 'infoLog', undefined);
    expect(mockConsoleInfo).toHaveBeenCalledWith('[info] infoLog');

    mockFormat.mockReturnValue('[info] infoLogMessageSupplier');
    log.info(() => 'infoLogMessageSupplier');
    expect(mockFormat).toHaveBeenCalledWith('info', 'infoLogMessageSupplier', undefined);
    expect(mockConsoleInfo).toHaveBeenCalledWith('[info] infoLogMessageSupplier');
  });

  test('warnレベルの場合にTransportにフォーマットされたメッセージを正しく渡しているかの検証', () => {
    const mockConsoleWarn = jest.spyOn(consoleTransport, 'warn').mockImplementation();
    const log = new Logger({level: 'warn', formatter, transports: [consoleTransport]});

    mockFormat.mockReturnValue('[warn] warnLog');
    log.warn('warnLog');
    expect(mockFormat).toHaveBeenCalledWith('warn', 'warnLog', undefined);
    expect(mockConsoleWarn).toHaveBeenCalledWith('[warn] warnLog');

    mockFormat.mockReturnValue('[warn] warnLogMessageSupplier');
    log.warn(() => 'warnLogMessageSupplier');
    expect(mockFormat).toHaveBeenCalledWith('warn', 'warnLogMessageSupplier', undefined);
    expect(mockConsoleWarn).toHaveBeenCalledWith('[warn] warnLogMessageSupplier');
  });

  test('errorレベルの場合にTransportにエラーとエラーコードを正しく渡しているかの検証', () => {
    const mockConsoleError = jest.spyOn(consoleTransport, 'error').mockImplementation();
    const log = new Logger({level: 'error', formatter, transports: [consoleTransport]});

    mockFormat.mockReturnValue('[error] [err0001] errorLog');
    const error = new Error('errorLog');
    log.error(error, 'err0001');
    expect(mockConsoleError).toHaveBeenCalledWith(error, 'err0001');
    log.error(error);
    expect(mockConsoleError).toHaveBeenCalledWith(error, 'UnexpectedError');
  });
});
