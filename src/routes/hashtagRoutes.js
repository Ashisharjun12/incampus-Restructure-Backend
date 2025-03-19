import express from 'express';
import { 
  getPostsByHashtag, 
  getTrendingHashtags,
  getAllHashtags,
  searchHashtags,
  getHashtagDetails
} from '../controllers/hashtagController.js';
import { authenticateUser } from '../middleware/authenticate.js';


const router = express.Router();

// Get all hashtags with pagination
router.get('/all', authenticateUser, getAllHashtags);

// Search hashtags
router.get('/search', authenticateUser, searchHashtags);

// Get hashtag details with posts
router.get('/details/:id', authenticateUser, getHashtagDetails);

// Get posts by hashtag
router.get('/tag/:tag', authenticateUser, getPostsByHashtag);

// Get trending hashtags
router.get('/trending', authenticateUser, getTrendingHashtags);

export default router; 