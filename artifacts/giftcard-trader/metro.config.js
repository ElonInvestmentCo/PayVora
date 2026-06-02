const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { createProxyMiddleware } = require("http-proxy-middleware");

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    // Proxy both /api/* and the legacy /proxy-api/* prefix to the API server on port 8080
    const proxy = createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
      pathFilter: (path) => path.startsWith("/api") || path.startsWith("/proxy-api"),
      pathRewrite: { "^/proxy-api": "/api" },
    });
    return (req, res, next) => {
      if (req.url && (req.url.startsWith("/api") || req.url.startsWith("/proxy-api"))) {
        return proxy(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
