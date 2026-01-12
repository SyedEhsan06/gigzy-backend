import express from 'express';
import { getGigs, createGig, getMyGigs, getGigById } from '../controllers/gig.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', getGigs);
router.get('/my-gigs', authMiddleware, getMyGigs);
router.get('/:id', getGigById);
router.post('/', authMiddleware, createGig);

export default router;
