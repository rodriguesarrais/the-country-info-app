import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
const baseUrlDate = process.env.BASE_URL_DATE
const baseUrlCountries = process.env.BASE_URL_CN;
export const getAllCountries = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${baseUrlDate}/api/v3/AvailableCountries`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'error fetching countries', error: (error as Error).message });
  }
};

export const getCountryInfo = async (req: Request, res: Response) => {
  const countryCode = req.params.code;

  try {
    const borderResponse = await axios.get(`${baseUrlDate}/api/v3/CountryInfo/${countryCode}`);
    const commonName = borderResponse.data.commonName;
    
    const [populationResponse, flagResponse] = await Promise.all([
      axios.post(`${baseUrlCountries}/api/v0.1/countries/population`, 
        { country: commonName },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      ),
      axios.post(`${baseUrlCountries}/api/v0.1/countries/flag/images`, 
        { iso2: countryCode },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      )
    ]);

    const countryDetails = {
      borders: borderResponse.data.borders,
      population: [],
      flag: ''
    };

    // handling population data
    if (populationResponse.data.data && Array.isArray(populationResponse.data.data.populationCounts)) {
      countryDetails.population = populationResponse.data.data.populationCounts;
    } else {
      console.error("population data missing or in unexpected format for country:", commonName);
      console.error("population response data:", populationResponse.data);
    }

    // handling flag data
    const flag = flagResponse.data.data?.flag;
    if (flag) {
      countryDetails.flag = flag;
    } else {
      console.error("flag data missing for country:", countryCode);
    }

    res.json(countryDetails);
  } catch (error) {
    
    res.status(500).json({ message: 'error fetching country info', error: (error as Error).message });
  }
};