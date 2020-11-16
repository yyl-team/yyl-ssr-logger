/** 日志类型 */
export declare enum LogType {
    Info = "info",
    Warn = "warn",
    Error = "error",
    Success = "success",
    System = "system"
}
/** 日志初始化配置 */
export interface LogOption<T> {
    /** 日志保存路径 */
    logPath?: string;
    /** 运行日志存储上限 */
    runtimeLimitSize?: number;
    /** 日志写入间隔 */
    writeInterval?: number;
    /** 运行日志名称 */
    runtimeFilename?: string;
    /** 错误日志名称 */
    errorFilename?: string;
    /** 打印日志 */
    verbose?: boolean;
    /** 格式化函数 */
    formatter?: (log: T & LogFormatOption) => string;
    /** 日志分隔符 */
    logSep?: string;
    /** debug 日志输出接受函数 */
    logger?: (type: LogType, args: any[]) => void;
}
/** log 属性用 types */
export declare type LogProperty<T> = Required<LogOption<T>>;
/** 日志入参 */
export interface LogArgu {
    /** 日志类型 */
    type?: LogType;
    /** 请求路径 */
    path?: string;
    /** 日志内容 */
    args: any[];
}
/** 日志 formatter 额外的参数 */
export interface LogFormatOption extends Required<LogArgu> {
    date: string;
}
/** 日志对象 */
export declare class Log<T = {}> {
    /** 日志缓存 */
    private logCache;
    /** interval key */
    private intervalKey;
    /** 运行日志目录 */
    private runtimeLogPath;
    /** 错误日志目录 */
    private errorLogPath;
    /** 日志存储路径 */
    private logPath;
    /** log 大小上限 */
    private runtimeLimitSize;
    /** 日志写入间隔 */
    private writeInterval;
    /** 打印日志 */
    private verbose;
    /** 运行日志文件名 */
    private runtimeFilename;
    /** 错误日志文件名 */
    private errorFilename;
    /** 日志分隔符 */
    private logSep;
    /** 日志解析器 */
    private formatter;
    /** debug 日志接收器 */
    private logger;
    constructor(option?: LogOption<T>);
    /** 日志记录 */
    log(op: T & LogArgu): void;
    /** 日志写入操作 */
    private writer;
    /** 日志清除 */
    clear(): void;
}
