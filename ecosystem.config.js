// ============================================================
// CASHBOT - Configuration PM2
// ============================================================
// Gestionnaire de processus pour la production
// ============================================================

module.exports = {
  apps: [{
    // Application principale (Bot + API)
    name: 'cashbot',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Environnement
    env: {
      NODE_ENV: 'production',
    },
    
    // Surveillance
    watch: false,
    max_memory_restart: '500M',
    
    // Logs
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    merge_logs: true,
    
    // Redémarrage automatique
    autorestart: true,
    restart_delay: 5000,
    max_restarts: 10,
    
    // Graceful shutdown
    kill_timeout: 10000,
    listen_timeout: 30000,
    shutdown_with_message: true,
    
    // Métriques
    metrics: false,
  }],
};