import path from 'path'
/** 日志类型 */
export enum LogType {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Success = 'success'
}

/** 日志初始化配置 */
export interface LogOption {
  /** 日志保存路径 */
  logPath?: string
  /** 日志存储上限 */
  limitSize?: number
  /** 日志写入间隔 */
  writeInterval?: number
}

/** 日志入参 */
export interface LogArgu {
  /** 日志类型 */
  type: LogType
  /** 请求路径 */
  path?: string
  /** 日志内容 */
  content?: string
  /** 打印日志 */
  verbose?: boolean
}

/** 日志对象 */
export class Log<A extends LogArgu = any> {
  /** 日志存储路径 */
  private logPath: string = path.join(process.cwd(), './log')
  /** log 大小上限 */
  private limitSize: number = 1000 * 1024 * 2
  /** 日志写入间隔 */
  private writeInterval: number = 1000
  /** 日志缓存 */
  private logCache: A[] = []
  /** 打印日志 */
  private verbose: boolean = false
  /** interval key */
  private intervalKey: any = 0
  constructor(option?: LogOption) {
    if (option?.logPath) {
      this.logPath = option.logPath
    }
    if (option?.limitSize !== undefined) {
      this.limitSize = option.limitSize
    }
    if (option?.writeInterval) {
      this.writeInterval = option.writeInterval
    }
  }

  /** 日志记录 */
  log(op: A) {
    // TODO:
  }

  /** 日志写入操作 */
  private writer() {
    // TODO:
  }

  /** 日志清除 */
  clear() {

  }
}
