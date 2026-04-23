/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build standalone pro Docker (imagem pequena, sem node_modules inteiro)
  output: "standalone",
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
    optimizePackageImports: ["lucide-react"],
    // Garante que Prisma engines + acervo + knowledge entrem no tracing do standalone
    outputFileTracingIncludes: {
      "/api/**/*": [
        "./node_modules/.prisma/**/*",
        "./node_modules/@prisma/client/**/*",
        "./prisma/**/*",
        "./knowledge/**/*",
        "./acervo/**/*"
      ],
      "/": ["./knowledge/**/*"],
      "/posts/[id]": ["./node_modules/.prisma/**/*"],
      "/new": ["./node_modules/.prisma/**/*"],
      "/admin/config": ["./node_modules/.prisma/**/*"]
    }
  }
};

export default nextConfig;
