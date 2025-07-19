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
    //CHAIN_ID: 97, // 97,
    
    //GAME_CONTRACT: "0x801B2B8b7B86147C88aA346378e626E5481b5e9d", // "0x5eeb7cee07a7aB072Fbf70f1FEc8793C276f2CB1",
    /*
    TITLE: "GGWorld Crash Game",
    RANDOM_GENERATOR: "0xa2d8526d12fa0a41007d2b5f33da81d0d6716fa9", // "0x33D44b8715349b26B5E16066647a9294F724a65c",
    TOKEN_ADDRESS: "0x1f832e8508bD9E95B4F65d252EAc40E70Cfd7A2A",
    
    */
    NEXT_PUBLIC_PROJECT_ID: "a23677c4af3139b4eccb52981f76ad94"
  }
}

module.exports = nextConfig
