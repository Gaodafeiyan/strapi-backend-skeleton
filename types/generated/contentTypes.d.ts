import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAiTokenAiToken extends Struct.CollectionTypeSchema {
  collectionName: 'ai-token';
  info: {
    description: 'AI\u4EE3\u5E01\u914D\u7F6E\u4FE1\u606F';
    displayName: 'AI\u4EE3\u5E01';
    pluralName: 'ai-tokens';
    singularName: 'ai-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    contractAddress: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ai-token.ai-token'
    > &
      Schema.Attribute.Private;
    logoUrl: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    priceApiId: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    priceSource: Schema.Attribute.Enumeration<
      ['coingecko', 'binance', 'dexscreener']
    > &
      Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    symbol: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    weight: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<20>;
  };
}

export interface ApiCacheCache extends Struct.CollectionTypeSchema {
  collectionName: 'cache';
  info: {
    displayName: '\u7F13\u5B58\u670D\u52A1';
    pluralName: 'caches';
    singularName: 'cache';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    key: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::cache.cache'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    ttl: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    value: Schema.Attribute.Text;
  };
}

export interface ApiChoujiangJiLuChoujiangJiLu
  extends Struct.CollectionTypeSchema {
  collectionName: 'choujiang-ji-lu';
  info: {
    displayName: '\u62BD\u5956\u8BB0\u5F55';
    pluralName: 'choujiang-ji-lus';
    singularName: 'choujiang-ji-lu';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    beiZhu: Schema.Attribute.Text;
    choujiangJihui: Schema.Attribute.Relation<
      'manyToOne',
      'api::choujiang-jihui.choujiang-jihui'
    >;
    chouJiangShiJian: Schema.Attribute.DateTime & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dingdan: Schema.Attribute.Relation<
      'manyToOne',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    jiangpin: Schema.Attribute.Relation<
      'manyToOne',
      'api::choujiang-jiangpin.choujiang-jiangpin'
    >;
    jiangPinJiaZhi: Schema.Attribute.String & Schema.Attribute.Required;
    jiangPinLeiXing: Schema.Attribute.Enumeration<
      ['SHANG_PIN', 'JIN_BI', 'YOU_HUI_QUAN']
    > &
      Schema.Attribute.Required;
    jiangPinMing: Schema.Attribute.String & Schema.Attribute.Required;
    lingQuShiJian: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::choujiang-ji-lu.choujiang-ji-lu'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    yonghu: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    zhuangtai: Schema.Attribute.Enumeration<
      ['zhongJiang', 'weiLingQu', 'yiLingQu', 'yiGuoQi']
    > &
      Schema.Attribute.DefaultTo<'zhongJiang'>;
  };
}

export interface ApiChoujiangJiangpinChoujiangJiangpin
  extends Struct.CollectionTypeSchema {
  collectionName: 'choujiang-jiangpin';
  info: {
    displayName: '\u62BD\u5956\u5956\u54C1';
    pluralName: 'choujiang-jiangpins';
    singularName: 'choujiang-jiangpin';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    jiangpinJiaZhi: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0'>;
    jiangpinLeiXing: Schema.Attribute.Enumeration<
      ['SHANG_PIN', 'JIN_BI', 'YOU_HUI_QUAN']
    > &
      Schema.Attribute.DefaultTo<'SHANG_PIN'>;
    jiangpinMiaoShu: Schema.Attribute.Text;
    jiangpinMing: Schema.Attribute.String & Schema.Attribute.Required;
    jiangpinTuPian: Schema.Attribute.String;
    kaiQi: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    kuCunShuLiang: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::choujiang-jiangpin.choujiang-jiangpin'
    > &
      Schema.Attribute.Private;
    paiXuShunXu: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    teBieJiangPin: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    yiFaChuShuLiang: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    zhongJiangGaiLv: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiChoujiangJihuiChoujiangJihui
  extends Struct.CollectionTypeSchema {
  collectionName: 'choujiang-jihui';
  info: {
    displayName: '\u62BD\u5956\u673A\u4F1A';
    pluralName: 'choujiang-jihuis';
    singularName: 'choujiang-jihui';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    chuangJianShiJian: Schema.Attribute.DateTime & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    daoQiShiJian: Schema.Attribute.DateTime;
    dingdan: Schema.Attribute.Relation<
      'manyToOne',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::choujiang-jihui.choujiang-jihui'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    shengYuCiShu: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    yiYongCiShu: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    yonghu: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    zhuangtai: Schema.Attribute.Enumeration<['active', 'used', 'expired']> &
      Schema.Attribute.DefaultTo<'active'>;
    zongCiShu: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiDinggouDingdanDinggouDingdan
  extends Struct.CollectionTypeSchema {
  collectionName: 'dinggou-dingdan';
  info: {
    displayName: '\u8BA4\u8D2D\u8BA2\u5355';
    pluralName: 'dinggou-dingdans';
    singularName: 'dinggou-dingdan';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    aiShuliang: Schema.Attribute.String & Schema.Attribute.DefaultTo<'0'>;
    benjinUSDT: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    jiangli: Schema.Attribute.Relation<
      'oneToOne',
      'api::yaoqing-jiangli.yaoqing-jiangli'
    >;
    jieshuShiJian: Schema.Attribute.DateTime & Schema.Attribute.Required;
    jihua: Schema.Attribute.Relation<
      'manyToOne',
      'api::dinggou-jihua.dinggou-jihua'
    >;
    jingtaiShouyi: Schema.Attribute.String & Schema.Attribute.DefaultTo<'0'>;
    kaishiShiJian: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::dinggou-dingdan.dinggou-dingdan'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    yonghu: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    zhuangtai: Schema.Attribute.Enumeration<
      ['active', 'redeemable', 'finished']
    > &
      Schema.Attribute.DefaultTo<'active'>;
  };
}

export interface ApiDinggouJihuaDinggouJihua
  extends Struct.CollectionTypeSchema {
  collectionName: 'dinggou-jihua';
  info: {
    displayName: '\u8BA4\u8D2D\u8BA1\u5212';
    pluralName: 'dinggou-jihuas';
    singularName: 'dinggou-jihua';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    aiBili: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0'>;
    benjinUSDT: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0'>;
    choujiangCi: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<3>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dingdanList: Schema.Attribute.Relation<
      'oneToMany',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    jihuaCode: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    jingtaiBili: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'0'>;
    kaiqi: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::dinggou-jihua.dinggou-jihua'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    zhouQiTian: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<15>;
  };
}

export interface ApiHealthHealth extends Struct.CollectionTypeSchema {
  collectionName: 'health';
  info: {
    displayName: '\u5065\u5EB7\u68C0\u67E5';
    pluralName: 'healths';
    singularName: 'health';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::health.health'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.String;
    timestamp: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiQianbaoChongzhiQianbaoChongzhi
  extends Struct.CollectionTypeSchema {
  collectionName: 'qianbao-chongzhi';
  info: {
    displayName: '\u94B1\u5305\u5145\u503C';
    pluralName: 'qianbao-chongzhis';
    singularName: 'qianbao-chongzhi';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
    'content-manager': {
      previewable: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::qianbao-chongzhi.qianbao-chongzhi'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    txHash: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    usdtJine: Schema.Attribute.String & Schema.Attribute.Required;
    yonghu: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    zhuangtai: Schema.Attribute.Enumeration<['pending', 'success', 'failed']> &
      Schema.Attribute.DefaultTo<'pending'>;
  };
}

export interface ApiQianbaoTixianQianbaoTixian
  extends Struct.CollectionTypeSchema {
  collectionName: 'qianbao-tixian';
  info: {
    displayName: '\u94B1\u5305\u63D0\u73B0';
    pluralName: 'qianbao-tixians';
    singularName: 'qianbao-tixian';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
    'content-manager': {
      previewable: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::qianbao-tixian.qianbao-tixian'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    toAddress: Schema.Attribute.String & Schema.Attribute.Required;
    txHash: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    usdtJine: Schema.Attribute.String & Schema.Attribute.Required;
    yonghu: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    zhuangtai: Schema.Attribute.Enumeration<
      ['pending', 'broadcasted', 'success', 'failed']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
  };
}

export interface ApiQianbaoYueQianbaoYue extends Struct.CollectionTypeSchema {
  collectionName: 'qianbao-yue';
  info: {
    displayName: '\u94B1\u5305\u4F59\u989D';
    pluralName: 'qianbao-yues';
    singularName: 'qianbao-yue';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    aiTokenBalances: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<'{}'>;
    aiYue: Schema.Attribute.String & Schema.Attribute.DefaultTo<'0'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::qianbao-yue.qianbao-yue'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    usdtYue: Schema.Attribute.String & Schema.Attribute.DefaultTo<'0'>;
    yonghu: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiQueueQueue extends Struct.CollectionTypeSchema {
  collectionName: 'queues';
  info: {
    description: 'Queue management';
    displayName: 'Queue';
    pluralName: 'queues';
    singularName: 'queue';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::queue.queue'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiShopCartShopCart extends Struct.CollectionTypeSchema {
  collectionName: 'shop-cart';
  info: {
    displayName: '\u8D2D\u7269\u8F66';
    pluralName: 'shop-carts';
    singularName: 'shop-cart';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-cart.shop-cart'
    > &
      Schema.Attribute.Private;
    product: Schema.Attribute.Relation<
      'manyToOne',
      'api::shop-product.shop-product'
    >;
    publishedAt: Schema.Attribute.DateTime;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1>;
    selected: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiShopOrderShopOrder extends Struct.CollectionTypeSchema {
  collectionName: 'shop-order';
  info: {
    displayName: '\u5546\u57CE\u8BA2\u5355';
    pluralName: 'shop-orders';
    singularName: 'shop-order';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    cancelledAt: Schema.Attribute.DateTime;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deliveredAt: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-order.shop-order'
    > &
      Schema.Attribute.Private;
    notes: Schema.Attribute.Text;
    orderNumber: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    orderStatus: Schema.Attribute.Enumeration<
      ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    paidAt: Schema.Attribute.DateTime;
    product: Schema.Attribute.Relation<
      'manyToOne',
      'api::shop-product.shop-product'
    >;
    publishedAt: Schema.Attribute.DateTime;
    quantity: Schema.Attribute.Integer & Schema.Attribute.Required;
    shippedAt: Schema.Attribute.DateTime;
    shippingAddress: Schema.Attribute.Text;
    shippingName: Schema.Attribute.String;
    shippingPhone: Schema.Attribute.String;
    totalAmount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    trackingNumber: Schema.Attribute.String;
    unitPrice: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    walletTransaction: Schema.Attribute.Relation<
      'oneToOne',
      'api::qianbao-yue.qianbao-yue'
    >;
  };
}

export interface ApiShopProductShopProduct extends Struct.CollectionTypeSchema {
  collectionName: 'shop-product';
  info: {
    displayName: '\u5546\u57CE\u5546\u54C1';
    pluralName: 'shop-products';
    singularName: 'shop-product';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isHot: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isNew: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isRecommend: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-product.shop-product'
    > &
      Schema.Attribute.Private;
    originalPrice: Schema.Attribute.Decimal;
    productCategory: Schema.Attribute.Enumeration<
      ['SHANG_PIN', 'JIN_BI', 'YOU_HUI_QUAN']
    > &
      Schema.Attribute.DefaultTo<'SHANG_PIN'>;
    productDescription: Schema.Attribute.Text;
    productImages: Schema.Attribute.Media<undefined, true>;
    productName: Schema.Attribute.String & Schema.Attribute.Required;
    productPrice: Schema.Attribute.Decimal & Schema.Attribute.Required;
    productSpecs: Schema.Attribute.JSON;
    productStatus: Schema.Attribute.Enumeration<
      ['active', 'inactive', 'out_of_stock']
    > &
      Schema.Attribute.DefaultTo<'active'>;
    productTags: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    shopOrders: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-order.shop-order'
    >;
    soldQuantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    stockQuantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTokenRewardRecordTokenRewardRecord
  extends Struct.CollectionTypeSchema {
  collectionName: 'token-reward-record';
  info: {
    description: 'AI\u4EE3\u5E01\u8D60\u9001\u8BB0\u5F55';
    displayName: '\u4EE3\u5E01\u8D60\u9001\u8BB0\u5F55';
    pluralName: 'token-reward-records';
    singularName: 'token-reward-record';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    amount: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 1000000000;
          min: 0;
        },
        number
      >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::token-reward-record.token-reward-record'
    > &
      Schema.Attribute.Private;
    order: Schema.Attribute.Relation<
      'manyToOne',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'api::ai-token.ai-token'>;
    tokenPrice: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 999999.99999999;
          min: 0;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    usdtValue: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 999999.99;
          min: 0;
        },
        number
      >;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiWalletAddressWalletAddress
  extends Struct.CollectionTypeSchema {
  collectionName: 'wallet_addresses';
  info: {
    description: '\u70ED\u94B1\u5305\u5730\u5740\u6C60\u7BA1\u7406';
    displayName: '\u94B1\u5305\u5730\u5740';
    pluralName: 'wallet-addresses';
    singularName: 'wallet-address';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
    'content-manager': {
      previewable: false;
    };
  };
  attributes: {
    address: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 42;
        minLength: 26;
      }>;
    asset: Schema.Attribute.Enumeration<['USDT', 'AI_TOKEN', 'ETH', 'BNB']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'USDT'>;
    balance: Schema.Attribute.String & Schema.Attribute.DefaultTo<'0'>;
    chain: Schema.Attribute.Enumeration<['BSC', 'ETH', 'TRON']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'BSC'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    last_used_at: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::wallet-address.wallet-address'
    > &
      Schema.Attribute.Private;
    max_balance: Schema.Attribute.String & Schema.Attribute.DefaultTo<'10000'>;
    priority: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<50>;
    private_key: Schema.Attribute.Text & Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    tags: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    usage_count: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    wallet_status: Schema.Attribute.Enumeration<
      ['active', 'inactive', 'maintenance']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
  };
}

export interface ApiYaoqingJiangliYaoqingJiangli
  extends Struct.CollectionTypeSchema {
  collectionName: 'yaoqing-jiangli';
  info: {
    displayName: '\u9080\u8BF7\u5956\u52B1';
    pluralName: 'yaoqing-jianglis';
    singularName: 'yaoqing-jiangli';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    laiyuanDan: Schema.Attribute.Relation<
      'oneToOne',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    laiyuanRen: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::yaoqing-jiangli.yaoqing-jiangli'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    shouyiUSDT: Schema.Attribute.String & Schema.Attribute.Required;
    tuijianRen: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: '\u7528\u6237\u6269\u5C55';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dinggouOrders: Schema.Attribute.Relation<
      'oneToMany',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    qianbao: Schema.Attribute.Relation<
      'oneToOne',
      'api::qianbao-yue.qianbao-yue'
    >;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    shangji: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    shopCarts: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-cart.shop-cart'
    >;
    shopOrders: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-order.shop-order'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    xiaji: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    yaoqingMa: Schema.Attribute.String &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 9;
        minLength: 9;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::ai-token.ai-token': ApiAiTokenAiToken;
      'api::cache.cache': ApiCacheCache;
      'api::choujiang-ji-lu.choujiang-ji-lu': ApiChoujiangJiLuChoujiangJiLu;
      'api::choujiang-jiangpin.choujiang-jiangpin': ApiChoujiangJiangpinChoujiangJiangpin;
      'api::choujiang-jihui.choujiang-jihui': ApiChoujiangJihuiChoujiangJihui;
      'api::dinggou-dingdan.dinggou-dingdan': ApiDinggouDingdanDinggouDingdan;
      'api::dinggou-jihua.dinggou-jihua': ApiDinggouJihuaDinggouJihua;
      'api::health.health': ApiHealthHealth;
      'api::qianbao-chongzhi.qianbao-chongzhi': ApiQianbaoChongzhiQianbaoChongzhi;
      'api::qianbao-tixian.qianbao-tixian': ApiQianbaoTixianQianbaoTixian;
      'api::qianbao-yue.qianbao-yue': ApiQianbaoYueQianbaoYue;
      'api::queue.queue': ApiQueueQueue;
      'api::shop-cart.shop-cart': ApiShopCartShopCart;
      'api::shop-order.shop-order': ApiShopOrderShopOrder;
      'api::shop-product.shop-product': ApiShopProductShopProduct;
      'api::token-reward-record.token-reward-record': ApiTokenRewardRecordTokenRewardRecord;
      'api::wallet-address.wallet-address': ApiWalletAddressWalletAddress;
      'api::yaoqing-jiangli.yaoqing-jiangli': ApiYaoqingJiangliYaoqingJiangli;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
