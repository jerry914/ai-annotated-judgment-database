const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // publicPath: process.env.NODE_ENV === "production" ? "/ai-annotated-judgment-database/" : "/",
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://hssai-verdictdb.phys.nthu.edu.tw',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
