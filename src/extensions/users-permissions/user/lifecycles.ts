import { customAlphabet } from 'nanoid';

const nanoid8 = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789', 8);

const YonghuLife = {
  async beforeCreate({ params }: any) {
    params.data.yaoqingMa = nanoid8();
  },
};
export default YonghuLife; 