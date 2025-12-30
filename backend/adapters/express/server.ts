import app from './app.ts';

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Express adapter listening on http://localhost:${port}`);
});
