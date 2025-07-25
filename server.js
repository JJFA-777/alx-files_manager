import express from 'express';
import router from './routes/index';

const app = express();
app.use(express.json());
app.use('/', router);

export default app;

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
