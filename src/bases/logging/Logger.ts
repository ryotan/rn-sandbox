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
import {SimpleLogFormatter} from './SimpleLogFormatter';
import type {Transport} from './Transport';

/**
 * ロガーです。
 * ログレベルや、出力先をオプションで指定できます。
 */
class Logger {
  private level: number;
  private formatter: LogFormatter;
  private transports: Transport[];

  /**
   * ロガーのコンストラクタです。
   * @param options ロガーオプション
   */
  constructor(options?: LoggerOptions) {
    const mergedOptions = {...DEFAULT_LOGGER_OPTIONS, ...options};
    this.level = LogLevelSet[mergedOptions.level];
    this.formatter = mergedOptions.formatter;
    this.transports = mergedOptions.transports;
  }

  /**
   * 指定されたログレベルが、ログ出力適用対象かを判定します。
   * @param level ログレベル
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return this.level <= LogLevelSet[level];
  }

  /**
   * 指定されたログレベルで、{@link Transport}のメソッドを呼び出します。
   *
   * @param level ログレベル
   * @param message 出力したいメッセージ
   */
  private callLeveledTransportMethod(level: Exclude<LogLevel, 'mute' | 'error'>, message: string | LogMessageSupplier) {
    if (this.isLevelEnabled(level)) {
      const formatted = this.formatMessage(level, message);
      this.transports.forEach(t => t[level](formatted));
    }
  }

  /**
   * ログレベルを設定します。
   * @param level ログレベル
   * @returns ロガーインスタンス
   */
  setLevel(level: LogLevel): Logger {
    this.level = LogLevelSet[level];
    return this;
  }

  /**
   * traceレベルのログを出力します。
   * @param message ログメッセージ
   * @returns ロガーインスタンス
   */
  trace(message: string | LogMessageSupplier): Logger {
    this.callLeveledTransportMethod('trace', message);
    return this;
  }

  /**
   * debugレベルのログを出力します。
   * @param message ログメッセージ
   * @returns ロガーインスタンス
   */
  debug(message: string | LogMessageSupplier): Logger {
    this.callLeveledTransportMethod('debug', message);
    return this;
  }

  /**
   * infoレベルのログを出力します。
   * @param message ログメッセージ
   * @returns ロガーインスタンス
   */
  info(message: string | LogMessageSupplier): Logger {
    this.callLeveledTransportMethod('info', message);
    return this;
  }

  /**
   * warnレベルのログを出力します。
   * @param message ログメッセージ
   * @returns ロガーインスタンス
   */
  warn(message: string | LogMessageSupplier): Logger {
    this.callLeveledTransportMethod('warn', message);
    return this;
  }

  /**
   * errorレベルのログを出力します。
   * @param error エラー
   * @param errorCode エラーコード
   * @returns ロガーインスタンス
   */
  error(error: Error, errorCode: string = 'UnexpectedError'): Logger {
    if (this.isLevelEnabled('error')) {
      this.transports.forEach(t => t.error(error, errorCode));
    }
    return this;
  }

  /**
   * LogFormatterを使用してメッセージをフォーマットします。
   * @param level ログレベル
   * @param message ログメッセージ
   * @param errorCode エラーコード
   * @returns メッセージ
   */
  formatMessage(level: LogLevel, message: string | LogMessageSupplier, errorCode?: string) {
    if (typeof message === 'string') {
      return this.formatter.format(level, message, errorCode);
    }
    return this.formatter.format(level, message(), errorCode);
  }
}

/**
 * ログレベルのセットです。
 */
const LogLevelSet = {
  trace: -1,
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  mute: Number.POSITIVE_INFINITY,
};
type LogLevel = keyof typeof LogLevelSet;

/**
 * ログに出力するメッセージを取得するためのインターフェースです。
 */
interface LogMessageSupplier {
  (): string;
}

/**
 * ログに出力するメッセージのフォーマッタです。
 */
interface LogFormatter {
  /**
   * メッセージをフォーマットします。
   * @param level ログレベル
   * @param message メッセージ
   * @param errorCode エラーコード
   * @returns フォーマット後のメッセージ
   */
  format(level: LogLevel, message: string, errorCode?: string): string;
}

/**
 * ロガーに設定できるオプションです。
 */
interface LoggerOptions {
  level?: LogLevel;
  formatter?: LogFormatter;
  transports?: Transport[];
}

/**
 * ロガーのデフォルトオプションです。
 */
const DEFAULT_LOGGER_OPTIONS: Required<LoggerOptions> = {
  level: 'info',
  formatter: new SimpleLogFormatter(),
  transports: [new ConsoleTransport()],
};

/**
 * ロガーを生成します。
 * @param options ロガーオプション
 */
function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

export type {LogLevel, LoggerOptions, LogMessageSupplier, LogFormatter};
export {Logger, createLogger, LogLevelSet};
