module.exports = {
	apps: [{
		name: 'dice',
		script: 'server.js',
		instances: 'max',
		exec_mode: 'cluster',
		autorestart: true,
		watch: false,
		max_memory_restart: '512M',
		env: {
			NODE_ENV: 'production',
			PORT: 3000
		},
		error_file: './logs/err.log',
		out_file: './logs/out.log',
		log_file: './logs/combined.log',
		time: true,

		// Configurações de performance
		max_restarts: 10,
		min_uptime: '10s',
		listen_timeout: 5000,
		kill_timeout: 5000,

		// Evitar restart durante deploy
		wait_ready: true,

		// Configurações de monitoramento
		pmx: true,

		// Variáveis de ambiente específicas para produção
		env_production: {
			NODE_ENV: 'production',
			PORT: 3000,
		}
	}]
}