import { Injectable, LoggerService, Scope } from '@nestjs/common';
import Logger, { createLogger, Stream } from 'bunyan';
import * as config from 'config';
import { LoggerConfig } from './logger-config.model';
import { LoggerParams } from './logger-params.model';

const loggerConfig = config.get<LoggerConfig>('logger');

@Injectable({ scope: Scope.TRANSIENT })
export class ApiLogger implements LoggerService {

  private logger: Logger;

  public constructor() {
    this.initBunyan('api');
  }

  private initBunyan(context: string): void {
    const streams = this.getStreams(loggerConfig);

    this.logger = createLogger({
      name: context,
      streams: streams as Stream[]
    });
  }

  private getStreams(loggerConfig: LoggerConfig): Stream[] {
    const streams: Stream[] = [];

    if (loggerConfig.console.enabled) {
      const { level } = loggerConfig.console;

      streams.push({
        level: level ?? 'trace',
        stream: process.stdout
      });
    }

    return streams;
  }

  public log(message: string, context?: string, data?: LoggerParams): void {
    this.logger.info({ message, ...data });
  }

  public error(message: string, trace?: string, context?: string, data?: LoggerParams): void {
    this.logger.error({ message, trace, ...data });
  }
  
  public warn(message: string, context?: string, data?: LoggerParams): void {
    this.logger.warn({ message, ...data });
  }
  
  public debug(message: string, context?: string, data?: LoggerParams): void {
    this.logger.debug({ message, ...data });
  }
  
  public verbose(message: string, context?: string, data?: LoggerParams): void {
    this.logger.trace({ message, ...data });
  }

  public setContext(context: string): void {
    this.initBunyan(context);
  }

}
