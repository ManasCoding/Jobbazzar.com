/**
 * config/env.js
 * Validates required environment variables at startup.
 * The server will exit immediately if any critical variable is missing,
 * preventing subtle runtime failures.
 */

const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[ENV ERROR] Missing required environment variables: ${missing.join(', ')}`
    );
    process.exit(1);
  }

  console.log('[ENV] All required environment variables are present ✓');
};

export default validateEnv;
