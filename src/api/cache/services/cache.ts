import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::cache.cache' as any, ({ strapi }) => ({
  /**
   * 获取缓存
   */
  async get(key: string) {
    try {
      if (!strapi.redis) {
        console.warn('Redis未配置，跳过缓存');
        return null;
      }
      
      const value = await strapi.redis.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error('缓存获取失败:', error);
      return null;
    }
  },

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl: number = 3600) {
    try {
      if (!strapi.redis) {
        console.warn('Redis未配置，跳过缓存');
        return false;
      }
      
      await strapi.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('缓存设置失败:', error);
      return false;
    }
  },

  /**
   * 删除缓存
   */
  async del(key: string) {
    try {
      if (!strapi.redis) {
        return false;
      }
      
      await strapi.redis.del(key);
      return true;
    } catch (error) {
      console.error('缓存删除失败:', error);
      return false;
    }
  },

  /**
   * 批量删除缓存
   */
  async delPattern(pattern: string) {
    try {
      if (!strapi.redis) {
        return false;
      }
      
      const keys = await strapi.redis.keys(pattern);
      if (keys.length > 0) {
        await strapi.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('批量缓存删除失败:', error);
      return false;
    }
  },

  /**
   * 检查缓存是否存在
   */
  async exists(key: string) {
    try {
      if (!strapi.redis) {
        return false;
      }
      
      return await strapi.redis.exists(key) === 1;
    } catch (error) {
      console.error('缓存检查失败:', error);
      return false;
    }
  },

  /**
   * 设置缓存过期时间
   */
  async expire(key: string, ttl: number) {
    try {
      if (!strapi.redis) {
        return false;
      }
      
      await strapi.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('设置缓存过期时间失败:', error);
      return false;
    }
  },

  /**
   * 获取缓存剩余时间
   */
  async ttl(key: string) {
    try {
      if (!strapi.redis) {
        return -1;
      }
      
      return await strapi.redis.ttl(key);
    } catch (error) {
      console.error('获取缓存剩余时间失败:', error);
      return -1;
    }
  },

  /**
   * 清空所有缓存
   */
  async flush() {
    try {
      if (!strapi.redis) {
        return false;
      }
      
      await strapi.redis.flushdb();
      return true;
    } catch (error) {
      console.error('清空缓存失败:', error);
      return false;
    }
  },

  /**
   * 获取缓存统计信息
   */
  async getStats() {
    try {
      if (!strapi.redis) {
        return { connected: false };
      }
      
      const info = await strapi.redis.info();
      const keys = await strapi.redis.dbsize();
      
      return {
        connected: true,
        keys,
        info: info.split('\r\n').reduce((acc: any, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return { connected: false, error: error.message };
    }
  }
})); 