module.exports = {
  apps: [
    {
      name: "viral-engine",
      cwd: "/home/deployer/apps/viral-engine",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: process.env.PORT || "3001",
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Viral Engine Views",
      },
    },
  ],
};
