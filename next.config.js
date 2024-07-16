/** @type {import('next').NextConfig} */

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const nextConfig = {
  env: {
    BUILDTIME_ENV: process.env.BUILDTIME_ENV,
  },
  reactStrictMode: true,
  output: "standalone",
  compiler: {
    styledComponents: true,
  },
  transpilePackages: [
    'react-syntax-highlighter',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, context) => {
    // Ignore Storybook files during the Next.js build process
    config.module.rules.push({
      test: /\.stories\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader',
    });
    
    const rule = config.module.rules
      .find((rule) => rule.oneOf)
      .oneOf.find(
        (r) =>
          // Find the global CSS loader
          r.issuer && r.issuer.include && r.issuer.include.includes("_app")
      );
    if (rule) {
      rule.issuer.include = [
        rule.issuer.include,
        // Allow `monaco-editor` to import global CSS:
        /[\\/]node_modules[\\/]monaco-editor[\\/]/,
      ];
    }

    // See: https://github.com/vercel/next.js/issues/31692
    if (!context.isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["markdown", "typescript", "javascript"],
          filename: "static/[name].worker.js",
        })
      );
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.koji-cdn.com",
      },
      {
        protocol: "https",
        hostname: "youai-cdn.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "youai.imgix.net",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/profile/:username",
      },
      {
        source: "/@:username/followers",
        destination: "/profile/:username/followers",
      },
      {
        source: "/@:username/following",
        destination: "/profile/:username/following",
      },
      {
        source: "/@:username/:postId",
        destination: "/post/:postId?username=:username",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/desktop/windows/download',
        destination: 'https://downloads.mindstudio.ai/mindstudio.exe',
        permanent: false,
      },
      {
        source: '/desktop/mac/:slug/download',
        destination: 'https://downloads.mindstudio.ai/:slug.zip',
        permanent: false,
      },
      {
        source: '/agency',
        destination: '/partners',
        permanent: false,
      },
    ]
  },
};

module.exports = nextConfig;
