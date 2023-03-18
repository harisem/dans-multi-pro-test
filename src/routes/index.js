import { Router } from 'express';

import users from '~/modules/users/users.router.js';
import vacancies from '~/modules/jobs/jobs.router.js';

import { successRes } from '~/helpers';

const router = new Router();

// Public Routes
router.get('/', (req, res) => successRes(res, null, 'ok'));

router.use('/users', users);
router.use('/vacancies', vacancies);

export default router;
