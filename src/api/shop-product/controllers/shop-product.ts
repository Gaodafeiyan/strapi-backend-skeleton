import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::shop-product.shop-product',
  ({ strapi }) => ({
    // 获取商品列表
    async find(ctx) {
      const { page = 1, pageSize = 10, category, sort = 'createdAt:desc' } = ctx.query;
      
      const filters: any = {
        publishedAt: { $notNull: true },
      };
      
      if (category) {
        filters.productCategory = category;
      }
      
      const products = await strapi.entityService.findMany(
        'api::shop-product.shop-product',
        {
          filters,
          populate: { productImages: true },
          sort: [sort],
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
          },
        }
      );
      
      const total = await strapi.entityService.count('api::shop-product.shop-product', {
        filters,
      });
      
      return {
        data: products,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          pageCount: Math.ceil(total / parseInt(pageSize)),
          total,
        },
      };
    },
    
    // 获取商品详情
    async findOne(ctx) {
      const { id } = ctx.params;
      
      const product = await strapi.entityService.findOne(
        'api::shop-product.shop-product',
        id,
        {
          populate: { productImages: true },
        }
      );
      
      if (!product) {
        return ctx.notFound('商品不存在');
      }
      
      return { data: product };
    },
    
    // 搜索商品
    async search(ctx) {
      const { 
        page = 1, 
        pageSize = 10, 
        keyword, 
        category, 
        minPrice, 
        maxPrice,
        sort = 'createdAt:desc' 
      } = ctx.query;
      
      const filters: any = {
        publishedAt: { $notNull: true },
      };
      
      // 关键词搜索
      if (keyword) {
        filters.$or = [
          { productName: { $containsi: keyword } },
          { productDescription: { $containsi: keyword } },
          { productTags: { $containsi: keyword } },
        ];
      }
      
      // 分类筛选
      if (category) {
        filters.productCategory = category;
      }
      
      // 价格筛选
      if (minPrice || maxPrice) {
        filters.productPrice = {};
        if (minPrice) {
          filters.productPrice.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
          filters.productPrice.$lte = parseFloat(maxPrice);
        }
      }
      
      const products = await strapi.entityService.findMany(
        'api::shop-product.shop-product',
        {
          filters,
          populate: { productImages: true },
          sort: [sort],
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
          },
        }
      );
      
      const total = await strapi.entityService.count('api::shop-product.shop-product', {
        filters,
      });
      
      return {
        data: products,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          pageCount: Math.ceil(total / parseInt(pageSize)),
          total,
        },
      };
    },
    
    // 获取热门商品
    async getHotProducts(ctx) {
      const { limit = 10 } = ctx.query;
      
      const products = await strapi.entityService.findMany(
        'api::shop-product.shop-product',
        {
          filters: {
            publishedAt: { $notNull: true },
            productHot: true,
          },
          populate: { productImages: true },
          sort: ['productSales:desc'],
          pagination: {
            page: 1,
            pageSize: parseInt(limit),
          },
        }
      );
      
      return { data: products };
    },
    
    // 获取推荐商品
    async getRecommendedProducts(ctx) {
      const { limit = 10 } = ctx.query;
      
      const products = await strapi.entityService.findMany(
        'api::shop-product.shop-product',
        {
          filters: {
            publishedAt: { $notNull: true },
            productRecommended: true,
          },
          populate: { productImages: true },
          sort: ['createdAt:desc'],
          pagination: {
            page: 1,
            pageSize: parseInt(limit),
          },
        }
      );
      
      return { data: products };
    },
    
    // 获取商品分类
    async getCategories(ctx) {
      const products = await strapi.entityService.findMany(
        'api::shop-product.shop-product',
        {
          filters: {
            publishedAt: { $notNull: true },
          },
          fields: ['productCategory'],
        }
      );
      
      const categories = [...new Set(products.map((p: any) => p.productCategory))];
      
      return { data: categories };
    },
    
    // 更新商品销量
    async updateSales(ctx) {
      const { id } = ctx.params;
      const { quantity } = ctx.request.body;
      
      const product = await strapi.entityService.findOne(
        'api::shop-product.shop-product',
        id
      ) as any;
      
      if (!product) {
        return ctx.notFound('商品不存在');
      }
      
      const updatedProduct = await strapi.entityService.update(
        'api::shop-product.shop-product',
        id,
        {
          data: {
            productSales: (product.productSales || 0) + parseInt(quantity),
          },
        }
      );
      
      return { data: updatedProduct };
    },
  })
); 