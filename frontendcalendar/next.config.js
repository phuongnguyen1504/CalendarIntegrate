/** @type {import('next').NextConfig} */
const path = require("path");

const withTM = require("next-transpile-modules")([
  "@fullcalendar/common",
  "@babel/preset-react",
  "@fullcalendar/common",
  "@fullcalendar/daygrid",
  "@fullcalendar/interaction",
  "@fullcalendar/timeline",
  "@fullcalendar/resource-timeline",
  "@fullcalendar/scrollgrid",
  "@fullcalendar/react",
  "@fullcalendar/timegrid",
  "@fullcalendar/adaptive",
  "fullcalendar-copy-paste",
  "@bwobbones/fullcalendar5-rightclick",
  "react-jsx-context-menu",
]);

const nextConfig = {
  future: { webpack5: true },
  strictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  staticPageGenerationTimeout: 1000,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{loader: '@svgr/webpack', options: {icon: true}}],
    })
    config.optimization.splitChunks.cacheGroups = {
      common: {
        name: "common",
        chunks: "all",
      },
    };
    return config;
  },
};

module.exports = withTM(nextConfig);
