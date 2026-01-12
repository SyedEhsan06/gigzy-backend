import { Request, Response } from 'express';
import Gig from '../models/Gig';

export const getGigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    let query: any = { status: 'open' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query).populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createGig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, budget } = req.body;
    const ownerId = (req as any).user.id;

    const gig = new Gig({ title, description, budget, ownerId });
    await gig.save();

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyGigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user.id;
    const gigs = await Gig.find({ ownerId }).sort({ createdAt: -1 });
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGigById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gig = await Gig.findById(id).populate('ownerId', 'name email');
    
    if (!gig) {
      res.status(404).json({ message: 'Gig not found' });
      return;
    }

    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};