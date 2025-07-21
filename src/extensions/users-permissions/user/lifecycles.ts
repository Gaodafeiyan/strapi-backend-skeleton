import { customAlphabet } from 'nanoid';
import type { Lifecycle } from '@strapi/types';

const nanoid8 = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789', 8);

const YonghuLife: Lifecycle = {
  async beforeCreate({ params }) {
    params.data.yaoqingMa = nanoid8();
  },
};
export default YonghuLife; 