/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/host/dashboard',
                destination: '/host',
                permanent: true,
            },
        ]
    },
}

module.exports = nextConfig
