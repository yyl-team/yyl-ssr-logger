import path from 'path'
import fs from 'fs'
import { mkdirSync } from './lib/mkdirSync'
import dayjs from 'dayjs'
import chalk from 'chalk'

/** 日志类型 */
export enum LogType {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Success = 'success'
}

/** 日志初始化配置 */
export interface LogOption<T> {
  /** 日志保存路径 */
  logPath?: string
  /** 运行日志存储上限 */
  runtimeLimitSize?: number
  /** 日志写入间隔 */
  writeInterval?: number
  /** 运行日志名称 */
  runtimeFilename?: string
  /** 错误日志名称 */
  errorFilename?: string
  /** 打印日志 */
  verbose?: boolean
  /** 格式化函数 */
  formatter?: (log: T & LogFormatOption) => string
  /** 日志分隔符 */
  logSep?: string
}

/** log 属性用 types */
export type LogProperty<T> = Required<LogOption<T>>

/** 日志入参 */
export interface LogArgu {
  /** 日志类型 */
  type: LogType
  /** 请求路径 */
  path?: string
  /** 日志内容 */
  content?: string
}

/** 日志 formatter 额外的参数 */
export interface LogFormatOption extends Required<LogArgu> {
  date: string
}

/** 日志对象 */
export class Log<T = any> {
  /** 日志缓存 */
  private logCache: (T & Required<LogFormatOption>)[] = []
  /** interval key */
  private intervalKey: any = 0
  /** 运行日志目录 */
  private runtimeLogPath: string = ''
  /** 错误日志目录 */
  private errorLogPath: string = ''
  /** 日志存储路径 */
  private logPath: LogProperty<T>['logPath'] = path.join(process.cwd(), './log')
  /** log 大小上限 */
  private runtimeLimitSize: LogProperty<T>['runtimeLimitSize'] = 1000 * 1024 * 2
  /** 日志写入间隔 */
  private writeInterval: LogProperty<T>['writeInterval'] = 1000
  /** 打印日志 */
  private verbose: LogProperty<T>['verbose'] = false
  /** 运行日志文件名 */
  private runtimeFilename: LogProperty<T>['runtimeFilename'] = 'runtime.log'
  /** 错误日志文件名 */
  private errorFilename: LogProperty<T>['errorFilename'] = 'error.log'
  /** 日志分隔符 */
  private logSep: LogProperty<T>['logSep'] = '\n'
  /** 日志解析器 */
  private formatter: LogProperty<T>['formatter'] = (log) => {
    return JSON.stringify(log)
  }

  constructor(option?: LogOption<T>) {
    // 属性初始化
    if (option?.logPath) {
      this.logPath = option.logPath
    }
    if (option?.runtimeLimitSize !== undefined) {
      this.runtimeLimitSize = option.runtimeLimitSize
    }
    if (option?.writeInterval) {
      this.writeInterval = option.writeInterval
    }
    if (option?.verbose) {
      this.verbose = option.verbose
    }
    if (option?.runtimeFilename) {
      this.runtimeFilename = option.runtimeFilename
    }
    if (option?.errorFilename) {
      this.errorFilename = option.errorFilename
    }
    if (option?.formatter) {
      this.formatter = option.formatter
    }

    // 运行日志目录初始化
    const runtimeLogPath = path.resolve(this.logPath, this.runtimeFilename)
    mkdirSync(path.dirname(runtimeLogPath))
    fs.writeFileSync(runtimeLogPath, '')
    this.runtimeLogPath = runtimeLogPath

    // 错误日志目录初始化
    const errorLogPath = path.resolve(this.logPath, this.errorFilename)
    mkdirSync(path.dirname(errorLogPath))
    fs.writeFileSync(errorLogPath, '')
    this.errorLogPath = errorLogPath

    // 启动定时任务
    this.intervalKey = setInterval(() => {
      this.writer()
    }, this.writeInterval)
  }

  /** 日志记录 */
  log(op: T & LogArgu) {
    const { logCache, verbose } = this
    const param = {
      ...op,
      type: op.type,
      path: op.path || 'system',
      content: op.content || '',
      date: dayjs().format('YYYY-MM-DD hh:mm:ss')
    }
    logCache.push(param)
    if (verbose) {
      console.log(
        `${chalk.green('[ssr]')} - ${chalk[op.type === LogType.Error ? 'red' : 'gray'](
          `[${op.type}]`
        )}`,
        param.content
      )
    }
  }

  /** 日志写入操作 */
  private writer() {
    const { logCache, runtimeLimitSize, runtimeLogPath, errorLogPath, formatter, logSep } = this
    if (!logCache.length) {
      return
    }
    // 运行日志
    const runtimeLogs = logCache.map((log) => formatter(log))
    // 错误日志
    const errorLogs = logCache
      .filter((log) => log.type === LogType.Error)
      .map((log) => formatter(log))

    // 运行日志写入
    if (runtimeLogs.length) {
      if (runtimeLimitSize > 0) {
        if (fs.statSync(runtimeLogPath).size > runtimeLimitSize) {
          // 超出减一半
          const oriLogs = fs.readFileSync(runtimeLogPath).toString().split(logSep)
          fs.writeFileSync(
            runtimeLogPath,
            `${oriLogs.join(logSep)}${logSep}${runtimeLogs.join(logSep)}`
          )
        } else {
          fs.appendFileSync(runtimeLogPath, `${logSep}${runtimeLogs.join(logSep)}`)
        }
      } else {
        fs.appendFileSync(runtimeLogPath, `${logSep}${runtimeLogs.join(logSep)}`)
      }
    }

    // 错误日志写入
    if (errorLogs.length) {
      fs.appendFileSync(errorLogPath, `${logSep}${errorLogs.join(logSep)}`)
    }
  }

  /** 日志清除 */
  clear() {
    this.logCache = []
    clearInterval(this.intervalKey)
  }
}
