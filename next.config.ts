import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permite probar `npm run dev` desde el celular en la misma red Wi-Fi
  // (sin esto, Next.js bloquea los recursos de desarrollo por seguridad
  // cuando se accede por una IP distinta de localhost).
  allowedDevOrigins: ["192.168.1.159"],
};

export default nextConfig;
