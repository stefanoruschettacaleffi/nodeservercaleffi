module.exports = {
  apps: [{
    name: 'basic',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-221-205-23.us-east-2.compute.amazonaws.com',
      key: '~/.ssh/basicserverkeys.pem',
      ref: 'origin/master',
      repo: 'git@github.com:stefanoruschettacaleffi/nodeservercaleffi.git',
      path: '/home/ubuntu/basic',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
