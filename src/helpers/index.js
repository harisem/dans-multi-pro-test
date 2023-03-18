import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { APP_PORT } from '@env';
import { Models } from '~/models';

export const search = (data, query, key) => {
  return data.filter((item) => {
    const value = String(item[key]);
    return value.toLowerCase().includes(query.toLowerCase());
  });
};

export const pagination = (res, data, message, req) => {
  let meta = {
    status: 200,
  };

  meta.message = message;
  let output = { meta };

  if (data) output.data = data;
  if (data) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const slicedArray = data.slice(startIndex, endIndex);
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / limit);

    const baseUrl = `${req.protocol}://${req.hostname}:${APP_PORT || 3000}${
      req.originalUrl
    }`;

    const url = new URL(baseUrl);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    let firstPageUrl = undefined;
    let previousPageUrl = undefined;
    let nextPageUrl = undefined;
    let lastPageUrl = undefined;

    if (page <= totalPages) {
      const nextPage = page + 1;
      const nextQueryParams = new URLSearchParams(queryParams);
      nextQueryParams.set('limit', limit);

      if (page > 2 && page <= totalPages) {
        nextQueryParams.set('page', 1);
        firstPageUrl = `${baseUrl.split('?')[0]}?${nextQueryParams}`;
      }

      if (page < totalPages) {
        nextQueryParams.set('page', nextPage);
        nextPageUrl = `${baseUrl.split('?')[0]}?${nextQueryParams}`;
      }

      if (page > 1 && page <= totalPages) {
        nextQueryParams.set('page', page - 1);
        previousPageUrl = `${baseUrl.split('?')[0]}?${nextQueryParams}`;
      }

      if (page != totalPages) {
        nextQueryParams.set('page', totalPages);
        lastPageUrl = `${baseUrl.split('?')[0]}?${nextQueryParams}`;
      }
    }

    output.meta = {
      limit: limit,
      total: totalItems,
      currentPage: page,
      totalPage: totalPages,
      firstPage: firstPageUrl,
      previousPage: previousPageUrl,
      nextPage: nextPageUrl,
      lastPage: lastPageUrl,
    };

    output.data = slicedArray;
  }

  res.json(output);
};

export const successRes = (res, data, message, req) => {
  let meta = {
    status: 200,
  };

  meta.message = message;
  let output = { meta };

  if (data) output.data = data;

  return res.json(output);
};

class ExtendableError extends Error {
  constructor(message, status, extra) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    if (extra) {
      Object.keys(extra).forEach((key) => {
        this[key] = extra[key];
      });
    }
    Error.captureStackTrace(this, this.constructor.name);
  }
}

export class APIError extends ExtendableError {
  constructor(message, status = 500, extra = null) {
    super(message, status, extra);
  }
}

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    throw new APIError('Validation errors', 422, { issues: errors.array() });
  };
};

export const generateToken = (data, expiresIn = '90d') => {
  const options = {
    expiresIn,
  };
  return jwt.sign(data, process.env.JWT_SECRET_KEY, options);
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    throw new APIError('Token failed to verify', 401);
  }
};

export const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  req.user = null;

  if (!authorization) throw new APIError('Unauthorized', 401);

  const isBearerToken = authorization.startsWith('Bearer ');
  if (!isBearerToken) throw new APIError('Unauthorized', 401);

  const token = authorization.slice(7, authorization.length);

  const tokenData = await verifyToken(token);

  var user = await Models.User.findByPk(tokenData.id);
  if (!user) throw new APIError('Invalid Token.', 403);
  req.logged_user = tokenData.username;

  return next();
};
