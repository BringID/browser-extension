// Everything that should be executed during the pre-build step
for (const envVar of ['PROXY_URL']) {
  if (!process.env[envVar] || process.env[envVar] === '') {
    console.error(`Error: Environment variable ${envVar} is not set`);
    process.exit(1);
  }
}
