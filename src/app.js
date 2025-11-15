const express = require('express');
const analyticsRouter = require('./routes/analytics');
const { sessionMiddleware } = require('./middleware/session');

const app = express();

app.use(express.json());
app.use(sessionMiddleware);
app.use('/api/analytics', analyticsRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: 'The requested resource could not be found.',
    message: 'The requested resource could not be found.'
  });
});

module.exports = app;
