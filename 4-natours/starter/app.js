import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import qs from 'qs';
import cookieParser from 'cookie-parser';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import deepSanitize from './utils/deepSanitize.js';
import viewRouter from './routes/viewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static('./public'));

// Further HELMET configuration for Security Policy (CSP) to support Leaflet
const scriptSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://js.stripe.com',
];
const styleSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'ws://127.0.0.1:1234/',
];
const frameSrcUrls = ['https://js.stripe.com'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// Set security HTTP headers
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", ...frameSrcUrls],
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) Object.assign(req.query, mongoSanitize.sanitize(req.query));
  next();
});

// Data sanitization against XSS
app.use((req, res, next) => {
  req.body = deepSanitize(req.body);
  next();
});

// Prevent parameter pollution
const queryParser = (queryString) => {
  const whitelist = [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price',
  ];

  const parsed = qs.parse(queryString, {
    allowDots: true,
    allowPrototypes: true,
  });

  // Remove polluted params
  const cleaned = {};
  for (const key in parsed) {
    const value = parsed[key];
    if (Array.isArray(value)) {
      cleaned[key] = whitelist.includes(key) ? value : value[0]; // keep array only if whitelisted
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
};

// Attach the custom parser
app.set('query parser', queryParser);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 4) START SERVER
export default app;
