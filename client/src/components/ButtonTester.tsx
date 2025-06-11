import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ButtonTest {
  id: string;
  name: string;
  status: 'testing' | 'passed' | 'failed' | 'pending';
  errorMessage?: string;
  testFunction: () => Promise<boolean>;
}

interface TestResult {
  buttonId: string;
  name: string;
  passed: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export function ButtonTester() {
  const [tests, setTests] = useState<ButtonTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const buttonTests: ButtonTest[] = [
      {
        id: 'layout-compact',
        name: 'Compact Layout Button',
        status: 'pending',
        testFunction: async () => {
          // Test compact layout button functionality
          const button = document.querySelector('[data-testid="layout-compact"]') as HTMLButtonElement;
          if (!button) {
            const buttons = document.querySelectorAll('button');
            const compactButton = Array.from(buttons).find(btn => 
              btn.textContent?.toLowerCase().includes('compact')
            );
            if (compactButton) {
              compactButton.click();
              await new Promise(resolve => setTimeout(resolve, 100));
              return true;
            }
            return false;
          }
          button.click();
          await new Promise(resolve => setTimeout(resolve, 100));
          return true;
        }
      },
      {
        id: 'layout-expanded',
        name: 'Expanded Layout Button',
        status: 'pending',
        testFunction: async () => {
          const buttons = document.querySelectorAll('button');
          const expandedButton = Array.from(buttons).find(btn => 
            btn.textContent?.toLowerCase().includes('expanded')
          );
          if (expandedButton) {
            expandedButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          return false;
        }
      },
      {
        id: 'layout-focus',
        name: 'Focus Layout Button',
        status: 'pending',
        testFunction: async () => {
          const buttons = document.querySelectorAll('button');
          const focusButton = Array.from(buttons).find(btn => 
            btn.textContent?.toLowerCase().includes('focus')
          );
          if (focusButton) {
            focusButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          return false;
        }
      },
      {
        id: 'execute-trade',
        name: 'Execute Trade Button',
        status: 'pending',
        testFunction: async () => {
          const buttons = document.querySelectorAll('button');
          const tradeButton = Array.from(buttons).find(btn => 
            btn.textContent?.toLowerCase().includes('execute trade')
          );
          if (tradeButton) {
            tradeButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          return false;
        }
      },
      {
        id: 'ai-prediction',
        name: 'AI Prediction Button',
        status: 'pending',
        testFunction: async () => {
          const buttons = document.querySelectorAll('button');
          const aiButton = Array.from(buttons).find(btn => 
            btn.textContent?.toLowerCase().includes('ai prediction')
          );
          if (aiButton) {
            aiButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          return false;
        }
      },
      {
        id: 'system-boost',
        name: 'System Boost Button',
        status: 'pending',
        testFunction: async () => {
          const buttons = document.querySelectorAll('button');
          const boostButton = Array.from(buttons).find(btn => 
            btn.textContent?.toLowerCase().includes('system boost')
          );
          if (boostButton) {
            boostButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          return false;
        }
      },
      {
        id: 'alerts-toggle',
        name: 'Alerts Toggle Button',
        status: 'pending',
        testFunction: async () => {
          const alertButtons = document.querySelectorAll('button[class*="bell"], button svg[class*="bell"]');
          if (alertButtons.length > 0) {
            (alertButtons[0] as HTMLElement).click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          return false;
        }
      },
      {
        id: 'tab-navigation',
        name: 'Tab Navigation',
        status: 'pending',
        testFunction: async () => {
          const tabButtons = document.querySelectorAll('[role="tab"], [data-state="active"], [data-state="inactive"]');
          if (tabButtons.length > 0) {
            for (const tab of Array.from(tabButtons).slice(0, 3)) {
              (tab as HTMLElement).click();
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            return true;
          }
          return false;
        }
      }
    ];

    setTests(buttonTests);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const test of tests) {
      setCurrentTest(test.name);
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'testing' } : t
      ));

      try {
        const passed = await test.testFunction();
        const result: TestResult = {
          buttonId: test.id,
          name: test.name,
          passed,
          timestamp: new Date(),
          errorMessage: passed ? undefined : 'Button not found or not functional'
        };

        setResults(prev => [...prev, result]);
        setTests(prev => prev.map(t => 
          t.id === test.id ? { 
            ...t, 
            status: passed ? 'passed' : 'failed',
            errorMessage: result.errorMessage
          } : t
        ));

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        const result: TestResult = {
          buttonId: test.id,
          name: test.name,
          passed: false,
          timestamp: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };

        setResults(prev => [...prev, result]);
        setTests(prev => prev.map(t => 
          t.id === test.id ? { 
            ...t, 
            status: 'failed',
            errorMessage: result.errorMessage
          } : t
        ));
      }
    }

    setCurrentTest('');
    setIsRunning(false);
  };

  const getStatusIcon = (status: ButtonTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NEXUS Button Validation System</CardTitle>
          <CardDescription>
            Comprehensive testing of all UI button interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Total: {totalTests}
              </Badge>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Passed: {passedTests}
              </Badge>
              <Badge variant="destructive">
                Failed: {failedTests}
              </Badge>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </div>

          {isRunning && currentTest && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Currently testing: {currentTest}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium">{test.name}</p>
                    {test.errorMessage && (
                      <p className="text-sm text-red-600">{test.errorMessage}</p>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={
                    test.status === 'passed' ? 'default' :
                    test.status === 'failed' ? 'destructive' :
                    test.status === 'testing' ? 'secondary' :
                    'outline'
                  }
                >
                  {test.status}
                </Badge>
              </div>
            ))}
          </div>

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Test Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm">
                  Completed {results.length} tests with {passedTests} passing and {failedTests} failing.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Success rate: {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}