/**
 * 时区处理工具
 * 统一处理系统中的时间相关逻辑，避免时区问题
 */

/**
 * 获取当前UTC时间
 */
export function getCurrentUTCTime(): Date {
  return new Date();
}

/**
 * 将本地时间转换为UTC时间
 */
export function localToUTC(localTime: Date): Date {
  const utcTime = new Date(localTime.getTime() - localTime.getTimezoneOffset() * 60000);
  return utcTime;
}

/**
 * 将UTC时间转换为本地时间
 */
export function utcToLocal(utcTime: Date): Date {
  const localTime = new Date(utcTime.getTime() + utcTime.getTimezoneOffset() * 60000);
  return localTime;
}

/**
 * 格式化时间为ISO字符串（UTC）
 */
export function formatToUTCISO(date: Date): string {
  return date.toISOString();
}

/**
 * 计算两个时间之间的天数差
 */
export function getDaysDifference(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * 计算两个时间之间的小时差
 */
export function getHoursDifference(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600));
}

/**
 * 计算两个时间之间的分钟差
 */
export function getMinutesDifference(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 60));
}

/**
 * 检查时间是否已过期
 */
export function isExpired(date: Date): boolean {
  return getCurrentUTCTime() >= date;
}

/**
 * 检查时间是否在未来
 */
export function isInFuture(date: Date): boolean {
  return getCurrentUTCTime() < date;
}

/**
 * 添加天数到指定时间
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 添加小时到指定时间
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * 添加分钟到指定时间
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * 获取时间差的可读描述
 */
export function getTimeDifferenceDescription(startDate: Date, endDate: Date): string {
  const days = getDaysDifference(startDate, endDate);
  const hours = getHoursDifference(startDate, endDate);
  const minutes = getMinutesDifference(startDate, endDate);
  
  if (days > 0) {
    return `还需等待 ${days} 天`;
  } else if (hours > 0) {
    return `还需等待 ${hours} 小时`;
  } else if (minutes > 0) {
    return `还需等待 ${minutes} 分钟`;
  } else {
    return '即将到期';
  }
}

/**
 * 验证时间格式
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * 解析时间字符串为Date对象
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
}

/**
 * 获取当前时间戳（毫秒）
 */
export function getCurrentTimestamp(): number {
  return getCurrentUTCTime().getTime();
}

/**
 * 获取当前时间戳（秒）
 */
export function getCurrentTimestampSeconds(): number {
  return Math.floor(getCurrentTimestamp() / 1000);
} 