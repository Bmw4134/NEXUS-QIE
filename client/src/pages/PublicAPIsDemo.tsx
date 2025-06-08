import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, MapPin, Quote, GraduationCap, Calendar, Github, Coffee, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ApiResult {
  success: boolean;
  data?: any;
  error?: string;
  source: string;
}

export default function PublicAPIsDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryQuery, setCountryQuery] = useState('');
  const [githubUser, setGithubUser] = useState('');

  // Test various free APIs
  const { data: apiStatuses } = useQuery({
    queryKey: ['/api/public-apis/status'],
    refetchInterval: 30000
  });

  const { data: ipLocation } = useQuery({
    queryKey: ['/api/public-apis/ip-location'],
    enabled: true
  });

  const { data: randomAdvice, refetch: refetchAdvice } = useQuery({
    queryKey: ['/api/public-apis/advice'],
    enabled: false
  });

  const { data: randomQuote, refetch: refetchQuote } = useQuery({
    queryKey: ['/api/public-apis/quote'],
    enabled: false
  });

  const { data: activitySuggestion, refetch: refetchActivity } = useQuery({
    queryKey: ['/api/public-apis/activity'],
    enabled: false
  });

  const { data: dogImage, refetch: refetchDog } = useQuery({
    queryKey: ['/api/public-apis/dog-image'],
    enabled: false
  });

  const { data: exchangeRates } = useQuery({
    queryKey: ['/api/public-apis/exchange/USD'],
    enabled: true
  });

  const { data: countryInfo } = useQuery({
    queryKey: [`/api/public-apis/country/${countryQuery}`],
    enabled: !!countryQuery
  });

  const { data: wikiResult } = useQuery({
    queryKey: [`/api/public-apis/wikipedia/${searchQuery}`],
    enabled: !!searchQuery
  });

  const { data: githubData } = useQuery({
    queryKey: [`/api/public-apis/github/${githubUser}`],
    enabled: !!githubUser
  });

  const { data: universities } = useQuery({
    queryKey: [`/api/public-apis/universities/${countryQuery}`],
    enabled: !!countryQuery
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Free Public APIs Integration</h1>
        <p className="text-gray-600">Comprehensive demonstration of zero-authentication APIs</p>
      </div>

      {/* API Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            API Status Dashboard
          </CardTitle>
          <CardDescription>Real-time status of all integrated free APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {apiStatuses?.data && Object.entries(apiStatuses.data).map(([api, status]) => (
              <div key={api} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm capitalize">{api.replace(/([A-Z])/g, ' $1')}</span>
                <Badge variant={status ? "default" : "destructive"}>
                  {status ? "Active" : "Error"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="location" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="fun">Fun</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="space-y-4">
          {/* IP Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Your Location Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ipLocation?.success ? (
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>IP:</strong> {ipLocation.data.ip}</div>
                  <div><strong>City:</strong> {ipLocation.data.city}</div>
                  <div><strong>Region:</strong> {ipLocation.data.region}</div>
                  <div><strong>Country:</strong> {ipLocation.data.country}</div>
                  <div><strong>Timezone:</strong> {ipLocation.data.timezone}</div>
                  <div><strong>Currency:</strong> {ipLocation.data.currency}</div>
                </div>
              ) : (
                <p className="text-gray-500">Loading location data...</p>
              )}
            </CardContent>
          </Card>

          {/* Exchange Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Exchange Rates (USD Base)</CardTitle>
            </CardHeader>
            <CardContent>
              {exchangeRates?.success ? (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(exchangeRates.data.rates || {}).slice(0, 12).map(([currency, rate]) => (
                    <div key={currency} className="text-center p-2 border rounded">
                      <div className="font-semibold">{currency}</div>
                      <div className="text-sm">{Number(rate).toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Loading exchange rates...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {/* Random Content */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Quote className="w-5 h-5 mr-2" />
                  Inspirational Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {randomQuote?.success ? (
                  <div className="space-y-2">
                    <blockquote className="italic">"{randomQuote.data.content}"</blockquote>
                    <p className="text-right text-sm text-gray-600">— {randomQuote.data.author}</p>
                    <div className="flex flex-wrap gap-1">
                      {randomQuote.data.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Click to get a quote</p>
                )}
                <Button onClick={() => refetchQuote()} className="w-full">
                  Get New Quote
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Random Advice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {randomAdvice?.success ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">{randomAdvice.data}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Click to get advice</p>
                )}
                <Button onClick={() => refetchAdvice()} className="w-full">
                  Get New Advice
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Activity Suggestion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coffee className="w-5 h-5 mr-2" />
                Activity Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activitySuggestion?.success ? (
                <div className="space-y-2">
                  <h3 className="font-semibold">{activitySuggestion.data.activity}</h3>
                  <div className="flex justify-between text-sm">
                    <span>Type: {activitySuggestion.data.type}</span>
                    <span>Participants: {activitySuggestion.data.participants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price: {activitySuggestion.data.price === 0 ? 'Free' : `$${activitySuggestion.data.price}`}</span>
                    <span>Accessibility: {Math.round(activitySuggestion.data.accessibility * 100)}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Click to get an activity suggestion</p>
              )}
              <Button onClick={() => refetchActivity()} className="w-full">
                Suggest Activity
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          {/* Country Search */}
          <Card>
            <CardHeader>
              <CardTitle>Country Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter country name (e.g., Japan, Brazil)"
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
              />
              {countryInfo?.success && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{countryInfo.data.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Capital:</strong> {countryInfo.data.capital}</div>
                    <div><strong>Region:</strong> {countryInfo.data.region}</div>
                    <div><strong>Population:</strong> {countryInfo.data.population.toLocaleString()}</div>
                    <div><strong>Languages:</strong> {countryInfo.data.languages.join(', ')}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Universities */}
          {universities?.success && universities.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Universities in {countryQuery}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {universities.data.slice(0, 5).map((uni: any, index: number) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="font-semibold">{uni.name}</div>
                      <div className="text-sm text-gray-600">{uni.domains.join(', ')}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wikipedia Search */}
          <Card>
            <CardHeader>
              <CardTitle>Wikipedia Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter search term"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {wikiResult?.success && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{wikiResult.data[0]?.title}</h3>
                  <p className="text-sm">{wikiResult.data[0]?.description}</p>
                  {wikiResult.data[0]?.url && (
                    <a href={wikiResult.data[0].url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline text-sm">
                      Read more on Wikipedia
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* GitHub User Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Github className="w-5 h-5 mr-2" />
                GitHub User Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter GitHub username"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
              />
              {githubData?.success && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{githubData.data.name || githubData.data.login}</h3>
                  {githubData.data.bio && <p className="text-sm">{githubData.data.bio}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Public Repos:</strong> {githubData.data.publicRepos}</div>
                    <div><strong>Followers:</strong> {githubData.data.followers}</div>
                    <div><strong>Following:</strong> {githubData.data.following}</div>
                    {githubData.data.location && <div><strong>Location:</strong> {githubData.data.location}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fun" className="space-y-4">
          {/* Random Dog Image */}
          <Card>
            <CardHeader>
              <CardTitle>Random Dog Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dogImage?.success ? (
                <div className="text-center">
                  <img 
                    src={dogImage.data} 
                    alt="Random dog" 
                    className="max-w-full h-64 object-cover rounded-lg mx-auto"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Click to load a dog image</p>
                </div>
              )}
              <Button onClick={() => refetchDog()} className="w-full">
                Get New Dog Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}