import { customAlphabet } from 'nanoid';
import type { Lifecycles } from '@strapi/strapi';

const nanoid8 = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789', 8);

const YonghuLife: Lifecycles = {
  async beforeCreate({ params }) {
    params.data.yaoqingMa = nanoid8();
  },
};
export default YonghuLife; 