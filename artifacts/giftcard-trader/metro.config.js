const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { createProxyMiddleware } = require("http-proxy-middleware");

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    const proxy = createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
      pathRewrite: { "^/proxy-api": "/api" },
    });
    return (req, res, next) => {
      if (req.url && req.url.startsWith("/proxy-api")) {
        return proxy(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
