import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin esto, Turbopack infiere la raiz desde un package-lock.json que vive en
  // el home del usuario, fuera del repo, y avisa en cada build.
  turbopack: { root: path.resolve(process.cwd()) },
};

export default nextConfig;
