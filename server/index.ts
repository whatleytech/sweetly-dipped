import { app, PORT } from './api.js';

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Form data API: http://localhost:${PORT}/api/form-data`);
});
