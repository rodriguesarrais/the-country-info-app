import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Globe } from "lucide-react"

const baseUrl = process.env.BASE_URL

async function getCountriesList() {
  
  const res = await fetch(`${baseUrl}/api/countries`)
  if (!res.ok) {
    throw new Error('Failed to fetch countries list')
  }
  return res.json()
}

type Country = {
  countryCode: string
  name: string
}

export default async function Home() {
  const countries = await getCountriesList()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center flex items-center justify-center gap-2">
            <Globe className="w-8 h-8" aria-hidden="true" /> {/** just to make it prettier */}
            The Country Info App
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {countries.map((country: Country) => (
            <Card key={country.countryCode} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <Link href={`/country/${country.countryCode}`} className="block h-full">
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <div className="text-2xl font-semibold text-center text-primary mb-2">{country.name}</div>
                  <div className="text-sm text-muted-foreground text-center">Click to explore</div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}