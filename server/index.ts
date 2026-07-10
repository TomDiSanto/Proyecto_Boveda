import dotenv from 'dotenv';
dotenv.config();

// Import dinámico, para forzar que se ejecute DESPUÉS de dotenv.config()
async function start() {
  const { default: app } = await import('./app');
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
}

start();
