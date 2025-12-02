/** @type {import('next').NextConfig} */

const nextConfig = {
  distDir: 'build',
  basePath: (process.env.NODE_ENV == 'production') ? '/_NEXT_GEN_APP' : undefined,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
    CHAIN_ID: 97, // 56, 
    GAME_CONTRACT: "0xe7C4287a22a24D0f9B1e8ed76fA24c68F3226252", 
    DEPOSIT_CONTRACT: "0x0CE4B81b7693e444174AF6769dE7681bF5E2B82e",
    TITLE: "GG World Crash Game – Favorably Fair Crypto Game",
    NEXT_PUBLIC_PROJECT_ID: "b87a3c44755d7f346d350330ca573223",
    BACKEND: 'http://localhost:4100',
    BACKEND_WS: 'ws://localhost:4100', //'wss://ws.gg.world/', //'ws://localhost:4100', //'wss://test.energy-blockchain.ru/'
  }
}

module.exports = nextConfig
