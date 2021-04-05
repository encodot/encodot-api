import { LogLevelString } from 'bunyan';

export interface LoggerConfig {
  console: ConsoleLoggerConfig;
  rotatingFile: RotatingFileLoggerConfig;
}

export interface StreamLoggerConfig {
  enabled: boolean;
  level?: LogLevelString;
}

export interface ConsoleLoggerConfig extends StreamLoggerConfig {
}

export interface RotatingFileLoggerConfig extends StreamLoggerConfig {
  path: string;
  period: string;
  count: number;
}

export interface RotatingFileLoggerConfig extends StreamLoggerConfig {
  path: string;
  period: string;
  count: number;
}
