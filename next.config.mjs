/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [new URL('https://nix-tag-images.s3.amazonaws.com/**')]
  }
};

export default nextConfig;
