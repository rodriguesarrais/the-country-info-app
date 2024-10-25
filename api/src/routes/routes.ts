import express, { Request, Response } from 'express';
import { getAllCountries, getCountryInfo } from '../controllers/countriesController';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  res.send('countries api.');
});

router.get('/countries', getAllCountries);
router.get('/countries/:code', getCountryInfo);

export default router;