const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  BASE_URL: isDev ? process.env.BASE_URL : process.env.BASE_URL,

  FRONTEND_URL: isDev ? process.env.FRONTEND_URL : process.env.FRONTEND_URL,

  ADMIN_URL: isDev ? process.env.ADMIN_URL : process.env.ADMIN_URL,
};


