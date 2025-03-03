
const KEYSTONE_URL = process.env.KEYSTONE_URL || 'http://localhost:4000'
const Path = require('path')

module.exports = {
	webpack(config) {
		config.resolve.alias = {
			...config.resolve.alias,
			react: Path.dirname(require.resolve('react/package.json')),
			'react-dom': Path.dirname(require.resolve('react-dom/package.json')),
			'@keystone-6/core': Path.dirname(
				require.resolve('@keystone-6/core/package.json')
			),
		}
		config.externals = [...config.externals, '.prisma/client']
		return config
	},
	async rewrites() {
		return {
			beforeFiles: [
				{
					source: '/admin',
					destination: `${KEYSTONE_URL}/admin`,
				},
				{
					source: '/admin/:admin*',
					destination: `${KEYSTONE_URL}/admin/:admin*`,
				},
			],
		}
	},
}
