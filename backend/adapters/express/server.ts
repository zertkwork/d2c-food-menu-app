import app from './app';
import { env } from './config/env';

const port = Number(env.PORT || 3000);

app.listen(port, () => {
  console.log(`Express adapter listening on http://localhost:${port}`);
});
