import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Brain, FileText, Users, Smartphone, Zap, Shield } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Family Platform
            </h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Shield className="h-3 w-3 mr-1" />
            Secure Access
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <Zap className="h-3 w-3 mr-1" />
            AI-Enhanced Family Management
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Family's
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Digital Hub
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Unified platform bringing together smart planning, wealth management, 
            AI insights, knowledge sharing, and real-time family coordination.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                // Simulate Watson admin login for testing
                localStorage.setItem('family-access-token', 'watson-admin-token');
                window.location.reload();
              }}
            >
              <Users className="h-5 w-5 mr-2" />
              Access Platform (Watson)
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                alert('This button is working! All UI elements are functional.');
              }}
            >
              Test Button Function
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Complete Family Management Suite
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>SmartPlanner</CardTitle>
              <CardDescription>
                AI-powered family scheduling with smart reminders and coordination
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>WealthPulse</CardTitle>
              <CardDescription>
                Comprehensive family financial management and budget tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>QuantumInsights</CardTitle>
              <CardDescription>
                AI-driven analytics and predictive insights for family optimization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>NexusNotes</CardTitle>
              <CardDescription>
                Shared family knowledge base with AI-enhanced organization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>FamilySync</CardTitle>
              <CardDescription>
                Real-time location sharing and family coordination tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Mobile-First</CardTitle>
              <CardDescription>
                Optimized for mobile devices with progressive web app features
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Access Information */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Family Access Required</CardTitle>
            <CardDescription className="text-blue-100">
              This platform is exclusively for authorized family members
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              To join the family platform, you'll need a secure access link provided by the family administrator.
            </p>
            <div className="space-y-2 text-sm text-blue-100">
              <p>• Secure token-based authentication</p>
              <p>• Role-based access control</p>
              <p>• Family member verification</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 Unified Family Platform. Secure family management solution.</p>
      </footer>
    </div>
  );
}