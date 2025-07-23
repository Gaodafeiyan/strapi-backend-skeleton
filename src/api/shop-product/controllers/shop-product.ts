import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::shop-product.shop-product',
  ({ strapi }) => ({
    // 获取商品列表（带分页和筛选）
    async find(ctx) {
      try {
        const { 
          page = 1, 
          limit = 20, 
          category, 
          search, 
          sort = 'createdAt:desc',
          isHot,
          isNew,
          isRecommend 
        } = ctx.query;
        
        const filters: any = {
          publishedAt: { $notNull: true }, // 只显示已发布的商品
        };
        
        // 分类筛选
        if (category) {
          filters.productCategory = category;
        }
        
        // 搜索筛选
        if (search) {
          filters.$or = [
            { productName: { $containsi: search } },
            { productDescription: { $containsi: search } },
          ];
        }
        
        // 热门商品
        if (isHot === 'true') {
          filters.isHot = true;
        }
        
        // 新品
        if (isNew === 'true') {
          filters.isNew = true;
        }
        
        // 推荐商品
        if (isRecommend === 'true') {
          filters.isRecommend = true;
        }
        
        const query = {
          filters,
          populate: ['productImages'],
          sort: [sort],
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(limit),
          },
        };
        
        const { results, pagination } = await strapi.entityService.findPage(
          'api::shop-product.shop-product',
          query
        );
        
        return ctx.send({
          success: true,
          data: results,
          pagination,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取商品详情
    async findOne(ctx) {
      try {
        const { id } = ctx.params;
        
        const product = await strapi.entityService.findOne(
          'api::shop-product.shop-product',
          parseInt(id),
          {
            populate: ['productImages'],
          }
        );
        
        if (!product) {
          return ctx.notFound('商品不存在');
        }
        
        // 增加浏览量（可选）
        await strapi.entityService.update(
          'api::shop-product.shop-product',
          parseInt(id),
          {
            data: {
              // 这里可以添加浏览量字段
            },
          }
        );
        
        return ctx.send({
          success: true,
          data: product,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取热门商品
    async getHotProducts(ctx) {
      try {
        const { limit = 10 } = ctx.query;
        
        const products = await strapi.entityService.findMany(
          'api::shop-product.shop-product',
          {
            filters: {
              publishedAt: { $notNull: true },
              isHot: true,
            },
            populate: ['productImages'],
            sort: { sortOrder: 'asc', createdAt: 'desc' },
            limit: parseInt(limit),
          }
        );
        
        return ctx.send({
          success: true,
          data: products,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取新品
    async getNewProducts(ctx) {
      try {
        const { limit = 10 } = ctx.query;
        
        const products = await strapi.entityService.findMany(
          'api::shop-product.shop-product',
          {
            filters: {
              publishedAt: { $notNull: true },
              isNew: true,
            },
            populate: ['productImages'],
            sort: { sortOrder: 'asc', createdAt: 'desc' },
            limit: parseInt(limit),
          }
        );
        
        return ctx.send({
          success: true,
          data: products,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取推荐商品
    async getRecommendProducts(ctx) {
      try {
        const { limit = 10 } = ctx.query;
        
        const products = await strapi.entityService.findMany(
          'api::shop-product.shop-product',
          {
            filters: {
              publishedAt: { $notNull: true },
              isRecommend: true,
            },
            populate: ['productImages'],
            sort: { sortOrder: 'asc', createdAt: 'desc' },
            limit: parseInt(limit),
          }
        );
        
        return ctx.send({
          success: true,
          data: products,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 搜索商品
    async searchProducts(ctx) {
      try {
        const { 
          keyword, 
          page = 1, 
          limit = 20, 
          sort = 'createdAt:desc' 
        } = ctx.query;
        
        if (!keyword) {
          return ctx.badRequest('搜索关键词不能为空');
        }
        
        const filters = {
          publishedAt: { $notNull: true },
          $or: [
            { productName: { $containsi: keyword } },
            { productDescription: { $containsi: keyword } },
            { productTags: { $containsi: keyword } },
          ],
        };
        
        const query = {
          filters,
          populate: ['productImages'],
          sort: [sort],
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(limit),
          },
        };
        
        const { results, pagination } = await strapi.entityService.findPage(
          'api::shop-product.shop-product',
          query
        );
        
        return ctx.send({
          success: true,
          data: results,
          pagination,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    
    // 获取商品分类
    async getCategories(ctx) {
      try {
        const categories = [
          { value: 'SHANG_PIN', label: '商品' },
          { value: 'JIN_BI', label: '金币' },
          { value: 'YOU_HUI_QUAN', label: '优惠券' },
        ];
        
        return ctx.send({
          success: true,
          data: categories,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
); 