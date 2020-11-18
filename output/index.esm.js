/*!
 * yyl-ssr-logger esm 0.1.1
 * (c) 2020 - 2020 jackness
 * Released under the MIT License.
 */
import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import chalk from 'chalk';

function mkdirSync(toFile) {
    const tPath = toFile.replace(/[/\\]$/, '');
    const r = [];
    (function deep(iPath) {
        if (fs.existsSync(iPath) || /[/\\]$/.test(iPath)) ;
        else {
            deep(path.dirname(iPath));
            fs.mkdirSync(iPath);
            r.push(iPath);
        }
    })(tPath);
    return r;
}

/** 日志类型 */
var LogType;
(function (LogType) {
    LogType["Info"] = "info";
    LogType["Warn"] = "warn";
    LogType["Error"] = "error";
    LogType["Success"] = "success";
    LogType["System"] = "system";
})(LogType || (LogType = {}));
/** 日志对象 */
class Log {
    constructor(option) {
        /** 日志缓存 */
        this.logCache = [];
        /** interval key */
        this.intervalKey = 0;
        /** 运行日志目录 */
        this.runtimeLogPath = '';
        /** 错误日志目录 */
        this.errorLogPath = '';
        /** 日志存储路径 */
        this.logPath = path.join(process.cwd(), './log');
        /** log 大小上限 */
        this.runtimeLimitSize = 1000 * 1024 * 2;
        /** 日志写入间隔 */
        this.writeInterval = 1000;
        /** 打印日志 */
        this.verbose = false;
        /** 运行日志文件名 */
        this.runtimeFilename = 'runtime.log';
        /** 错误日志文件名 */
        this.errorFilename = 'error.log';
        /** 日志分隔符 */
        this.logSep = '\n';
        /** 日志解析器 */
        this.formatter = (log) => {
            const rLog = Object.assign({}, log);
            // 去掉 args 参数
            delete rLog.args;
            return JSON.stringify(rLog);
        };
        /** debug 日志接收器 */
        this.logger = (type, args) => {
            console.log(`${chalk.green('[ssr]')} - ${chalk[type === LogType.Error ? 'red' : 'gray'](`[${type}]`)}`, ...args);
        };
        // 属性初始化
        if (option === null || option === void 0 ? void 0 : option.logPath) {
            this.logPath = option.logPath;
        }
        if ((option === null || option === void 0 ? void 0 : option.runtimeLimitSize) !== undefined) {
            this.runtimeLimitSize = option.runtimeLimitSize;
        }
        if (option === null || option === void 0 ? void 0 : option.writeInterval) {
            this.writeInterval = option.writeInterval;
        }
        if (option === null || option === void 0 ? void 0 : option.verbose) {
            this.verbose = option.verbose;
        }
        if (option === null || option === void 0 ? void 0 : option.runtimeFilename) {
            this.runtimeFilename = option.runtimeFilename;
        }
        if (option === null || option === void 0 ? void 0 : option.errorFilename) {
            this.errorFilename = option.errorFilename;
        }
        if (option === null || option === void 0 ? void 0 : option.formatter) {
            this.formatter = option.formatter;
        }
        if (option === null || option === void 0 ? void 0 : option.logger) {
            this.logger = option.logger;
        }
        // 运行日志目录初始化
        const runtimeLogPath = path.resolve(this.logPath, this.runtimeFilename);
        mkdirSync(path.dirname(runtimeLogPath));
        fs.writeFileSync(runtimeLogPath, '');
        this.runtimeLogPath = runtimeLogPath;
        // 错误日志目录初始化
        const errorLogPath = path.resolve(this.logPath, this.errorFilename);
        mkdirSync(path.dirname(errorLogPath));
        fs.writeFileSync(errorLogPath, '');
        this.errorLogPath = errorLogPath;
        // 启动定时任务
        this.intervalKey = setInterval(() => {
            this.writer();
        }, this.writeInterval);
    }
    /** 日志记录 */
    log(op) {
        var _a;
        const { logCache, verbose, logger } = this;
        const param = Object.assign(Object.assign({}, op), { type: op.type || LogType.Info, path: op.path || 'system', content: ((_a = op.args) === null || _a === void 0 ? void 0 : _a.map((ctx) => {
                if (typeof ctx === 'object') {
                    if (typeof ctx.stack === 'string') {
                        return ctx.stack;
                    }
                    else {
                        return JSON.stringify(ctx);
                    }
                }
                else {
                    return ctx;
                }
            }).join(' ')) || '', date: dayjs().format('YYYY-MM-DD hh:mm:ss') });
        logCache.push(param);
        if (verbose) {
            logger(param.type, param.args);
        }
    }
    /** 日志写入操作 */
    writer() {
        const { logCache, runtimeLimitSize, runtimeLogPath, errorLogPath, formatter, logSep, verbose, logger } = this;
        if (!logCache.length) {
            return;
        }
        // 运行日志
        const runtimeLogs = logCache.map((log) => formatter(log));
        // 错误日志
        const errorLogs = logCache
            .filter((log) => log.type === LogType.Error)
            .map((log) => formatter(log));
        // 运行日志写入
        if (runtimeLogs.length) {
            if (runtimeLimitSize > 0) {
                const runtimeSize = fs.statSync(runtimeLogPath).size;
                if (runtimeSize > runtimeLimitSize) {
                    // 超出减一半
                    const oriLogs = fs.readFileSync(runtimeLogPath).toString().split(logSep);
                    fs.writeFileSync(runtimeLogPath, `${oriLogs.join(logSep)}${logSep}${runtimeLogs.join(logSep)}${logSep}`);
                }
                else {
                    fs.appendFileSync(runtimeLogPath, `${runtimeLogs.join(logSep)}${logSep}`);
                }
            }
            else {
                fs.appendFileSync(runtimeLogPath, `${runtimeLogs.join(logSep)}${logSep}`);
            }
        }
        // 错误日志写入
        if (errorLogs.length) {
            fs.appendFileSync(errorLogPath, `${errorLogs.join(logSep)}${logSep}`);
        }
        if (verbose) {
            logger(LogType.System, [
                '写入日志文件完成',
                `runtime: ${chalk.green(runtimeLogs.length)}`,
                `error: ${chalk.red(errorLogs.length)}`
            ]);
        }
        logCache.length = 0;
    }
    /** 日志清除 */
    clear() {
        this.logCache = [];
        clearInterval(this.intervalKey);
    }
}

export { Log, LogType };
