const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

// Walk every webpack rule and make sure each postcss-loader runs Tailwind +
// Autoprefixer. Doing this directly (instead of via craco's style.postcss
// option) is deterministic across craco/react-scripts versions.
function injectPostcssPlugins(webpackConfig) {
  const visit = (rule) => {
    if (!rule) return;
    if (Array.isArray(rule)) return rule.forEach(visit);
    if (rule.oneOf) rule.oneOf.forEach(visit);
    if (rule.use) {
      const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
      uses.forEach((u) => {
        const loader = u && (u.loader || u);
        if (typeof loader === "string" && loader.includes("postcss-loader")) {
          u.options = u.options || {};
          u.options.postcssOptions = u.options.postcssOptions || {};
          const po = u.options.postcssOptions;
          const existing = po.plugins;
          if (typeof existing === "function") {
            po.plugins = (...args) => [
              tailwindcss,
              autoprefixer,
              ...((existing(...args) || [])),
            ];
          } else {
            po.plugins = [tailwindcss, autoprefixer, ...(existing || [])];
          }
        }
      });
    }
  };
  visit(webpackConfig.module.rules);
}

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      injectPostcssPlugins(webpackConfig);
      // face-api.js references Node core modules absent in the browser bundle.
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        fs: false,
        crypto: false,
        path: false,
        stream: false,
      };
      return webpackConfig;
    },
  },
};
