import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';

import { APP_HOST, APP_PORT, RATE_LIMIT, SECRET_KEY } from '@env';

import errorHandler from '~/middlewares/error_handler';
import { APIError } from '~/helpers';
import routes from '~/routes';

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.static('public'));

app.use(rateLimit({ max: Number(RATE_LIMIT), windowMs: 15 * 60 * 1000 }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.text({ type: 'text/plain' }));
app.use(
  session({
    secret: SECRET_KEY,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 * 2 },
    resave: true,
    saveUninitialized: true,
  })
);

app.use(routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  throw new APIError('Not found', 404);
});

app.use(errorHandler);

app.listen(Number(APP_PORT), APP_HOST, () => {
  console.log(`Server is running on http://${APP_HOST}:${APP_PORT}`);
});

export default app;
