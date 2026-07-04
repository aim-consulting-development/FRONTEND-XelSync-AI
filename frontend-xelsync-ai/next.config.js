// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite conexiones desde otras IPs en desarrollo
  allowedDevOrigins: ['192.168.56.1', 'localhost', '127.0.0.1'],
  
  // Configuración de imágenes (si usas imágenes externas)
  images: {
    domains: [], // Agrega dominios externos si los usas
    // O si usas imágenes locales, esto es suficiente
  },
  
  // Otras configuraciones útiles
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig