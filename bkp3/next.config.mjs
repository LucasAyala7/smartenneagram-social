/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
    // reduz tempo de compilação dos ícones (lucide-react importa ~1000 ícones)
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
