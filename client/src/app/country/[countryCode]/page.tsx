"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type BorderCountry = {
  commonName: string
  officialName: string
  countryCode: string
  region: string
}

type PopulationData = {
  year: number
  value: number
}

type CountryInfo = {
  borders: BorderCountry[]
  population: PopulationData[]
  flag: string
}

async function getCountryInfo(countryCode: string): Promise<CountryInfo> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // timeout to wait for country info

  try {
    const res = await fetch(`/api/countries/${countryCode}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errorBody = await res.text()
      console.error(`HTTP error! status: ${res.status}, body: ${errorBody}`)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    if (error instanceof Error) {
      console.error('fetch error:', error.message)
      throw error
    }
    throw new Error('unknown error')
  }
}

const formatPopulation = (population: number): string => {
  return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CountryInfo({ params }: { params: { countryCode: string } }) {
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCountryInfo = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCountryInfo(params.countryCode)
      setCountryInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCountryInfo()
  }, [params.countryCode])

  if (isLoading) {
    return <div className="container mx-auto p-4 max-w-4xl">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href='/' passHref>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Countries
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchCountryInfo} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (!countryInfo) {
    return <div className="container mx-auto p-4 max-w-4xl">No data available</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link href='/' passHref>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Countries
        </Button>
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Image
            src={countryInfo.flag}
            alt={`Flag of ${params.countryCode}`}
            width={80}
            height={53}
            className="rounded shadow-lg"
          />
          <CardTitle className="text-4xl font-bold">{params.countryCode}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Border Countries</h2>
            <div className="flex flex-wrap gap-2">
              {countryInfo.borders && countryInfo.borders.length > 0 ? (
                countryInfo.borders.map((country) => (
                  <Link key={country.countryCode} href={`/country/${country.countryCode}`}>
                    <Badge variant="secondary" className="cursor-pointer">
                      {country.commonName}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p>No bordering countries</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">Population Over Time</h2>
            {countryInfo.population && countryInfo.population.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={countryInfo.population}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPopulation(Number(value))} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8"
                    tickFormatter={(value) => formatPopulation(value)}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No population data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}