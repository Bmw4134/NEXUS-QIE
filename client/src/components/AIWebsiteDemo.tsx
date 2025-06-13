import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Wand2, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  Code, 
  Palette, 
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

interface WebsiteAnalysis {
  currentTech: string[];
  designScore: number;
  performanceScore: number;
  seoScore: number;
  recommendations: string[];
  screenshotUrl?: string;
}

interface RedesignProposal {
  framework: string;
  features: string[];
  timeline: string;
  estimatedCost: string;
  mockupUrl?: string;
  techStack: string[];
}

export default function AIWebsiteDemo() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [requirements, setRequirements] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [redesign, setRedesign] = useState<RedesignProposal | null>(null);

  const analyzeWebsite = useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      const response = await fetch('/api/ai/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setCurrentStep(1);
    }
  });

  const generateRedesign = useMutation({
    mutationFn: async ({ url, requirements }: { url: string; requirements: string }) => {
      const response = await fetch('/api/ai/generate-redesign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, requirements, analysis })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRedesign(data);
      setCurrentStep(2);
    }
  });

  const handleAnalyze = () => {
    if (websiteUrl) {
      analyzeWebsite.mutate({ url: websiteUrl });
    }
  };

  const handleRedesign = () => {
    if (websiteUrl && requirements) {
      generateRedesign.mutate({ url: websiteUrl, requirements });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Wand2 className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Let Us Reinvent Your Website
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          AI-powered website analysis and redesign generation. Get instant insights, 
          performance optimization, and complete redesign proposals.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Globe className="w-4 h-4" />
            <span>Web Scraping</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Code className="w-4 h-4" />
            <span>Code Generation</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[
            { step: 0, title: 'Input', icon: Globe },
            { step: 1, title: 'Analysis', icon: Sparkles },
            { step: 2, title: 'Redesign', icon: Palette }
          ].map(({ step, title, icon: Icon }, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? 'bg-purple-500 border-purple-500 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step ? 'text-purple-600' : 'text-gray-400'
              }`}>
                {title}
              </span>
              {index < 2 && (
                <ArrowRight className="w-4 h-4 mx-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Website Analysis</CardTitle>
            <CardDescription>
              Enter your website URL to get started with AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Website URL</label>
              <Input
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={!websiteUrl || analyzeWebsite.isPending}
              className="w-full"
            >
              {analyzeWebsite.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Website...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Analyze Website
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && analysis && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Analysis Results</CardTitle>
              <CardDescription>AI-powered insights about your current website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{analysis.designScore}</div>
                  <div className="text-sm text-gray-500">Design Score</div>
                  <Progress value={analysis.designScore} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{analysis.performanceScore}</div>
                  <div className="text-sm text-gray-500">Performance</div>
                  <Progress value={analysis.performanceScore} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">{analysis.seoScore}</div>
                  <div className="text-sm text-gray-500">SEO Score</div>
                  <Progress value={analysis.seoScore} className="mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Current Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.currentTech.map((tech, index) => (
                      <Badge key={index} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Improvement Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redesign Requirements</CardTitle>
              <CardDescription>Describe your vision for the new website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your requirements: modern design, faster performance, mobile-first, e-commerce features, etc."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleRedesign}
                disabled={!requirements || generateRedesign.isPending}
                className="w-full"
              >
                {generateRedesign.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Redesign...
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4 mr-2" />
                    Generate Redesign Proposal
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && redesign && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redesign Proposal</CardTitle>
              <CardDescription>AI-generated website redesign with full specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Recommended Framework</h3>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {redesign.framework}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Technology Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {redesign.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Key Features</h3>
                    <ul className="space-y-1">
                      {redesign.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Timeline</span>
                      <Badge variant="outline">{redesign.timeline}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Investment</span>
                      <span className="text-lg font-bold text-green-600">{redesign.estimatedCost}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      <Users className="w-4 h-4 mr-2" />
                      Schedule Consultation
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Detailed Proposal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ready to Transform Your Business?</CardTitle>
              <CardDescription>Join hundreds of companies that have revolutionized their online presence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-2xl">300%</div>
                  <div className="text-sm text-gray-500">Average Conversion Increase</div>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-bold text-2xl">2.5s</div>
                  <div className="text-sm text-gray-500">Average Load Time</div>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-bold text-2xl">500+</div>
                  <div className="text-sm text-gray-500">Successful Projects</div>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Your Transformation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}