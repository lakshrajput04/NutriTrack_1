import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Database, Brain, Wifi } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { browserMongoService } from '@/services/browserMongoService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

const APITester = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Gemini API Connection', status: 'pending', message: 'Not tested' },
    { name: 'Gemini Food Analysis', status: 'pending', message: 'Not tested' },
    { name: 'Gemini Health Coach', status: 'pending', message: 'Not tested' },
    { name: 'Gemini Meal Planning', status: 'pending', message: 'Not tested' },
    { name: 'MongoDB Connection', status: 'pending', message: 'Not tested' },
    { name: 'MongoDB CRUD Operations', status: 'pending', message: 'Not tested' }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (index: number, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, duration } : test
    ));
  };

  const runGeminiTests = async () => {
    // Test 1: Gemini API Connection
    try {
      const startTime = Date.now();
      const isWorking = await geminiService.isApiWorking();
      const duration = Date.now() - startTime;
      
      if (isWorking) {
        updateTestResult(0, 'success', 'API connection successful', duration);
      } else {
        updateTestResult(0, 'error', 'API connection failed');
      }
    } catch (error: any) {
      updateTestResult(0, 'error', `Connection error: ${error.message}`);
    }

    // Test 2: Food Analysis
    try {
      const startTime = Date.now();
      const result = await geminiService.analyzeFood('Apple and banana');
      const duration = Date.now() - startTime;
      
      if (result && result.foods.length > 0) {
        updateTestResult(1, 'success', `Analyzed ${result.foods.length} foods successfully`, duration);
      } else {
        updateTestResult(1, 'error', 'Food analysis returned empty result');
      }
    } catch (error: any) {
      updateTestResult(1, 'error', `Food analysis error: ${error.message}`);
    }

    // Test 3: Health Coach
    try {
      const startTime = Date.now();
      const response = await geminiService.getHealthCoachResponse('How can I lose weight?');
      const duration = Date.now() - startTime;
      
      if (response && response.trim().length > 10) {
        updateTestResult(2, 'success', `Coach response: ${response.slice(0, 50)}...`, duration);
      } else {
        updateTestResult(2, 'error', 'Coach response too short or empty');
      }
    } catch (error: any) {
      updateTestResult(2, 'error', `Coach error: ${error.message}`);
    }

    // Test 4: Meal Planning
    try {
      const startTime = Date.now();
      const mealPlan = await geminiService.generateMealPlan({
        dietType: 'balanced',
        calories: 2000,
        meals: 3
      });
      const duration = Date.now() - startTime;
      
      if (mealPlan && mealPlan.meals.length > 0) {
        updateTestResult(3, 'success', `Generated meal plan with ${mealPlan.meals.length} meals`, duration);
      } else {
        updateTestResult(3, 'error', 'Meal plan generation failed');
      }
    } catch (error: any) {
      updateTestResult(3, 'error', `Meal plan error: ${error.message}`);
    }
  };

  const runMongoDBTests = async () => {
    // Test 5: MongoDB Connection
    try {
      const startTime = Date.now();
      const connectionResult = await browserMongoService.testConnection();
      const duration = Date.now() - startTime;
      
      if (connectionResult.success) {
        updateTestResult(4, 'success', `MongoDB Atlas connected: ${connectionResult.message}`, duration);
      } else {
        updateTestResult(4, 'error', `MongoDB connection failed: ${connectionResult.error}`);
      }
    } catch (error: any) {
      updateTestResult(4, 'error', `MongoDB connection error: ${error.message}`);
    }

    // Test 6: CRUD Operations
    try {
      const startTime = Date.now();
      const crudResult = await browserMongoService.testCRUDOperations();
      const duration = Date.now() - startTime;
      
      if (crudResult.success) {
        updateTestResult(5, 'success', `CRUD simulation successful: User ID ${crudResult.user?._id}`, duration);
      } else {
        updateTestResult(5, 'error', `CRUD operations failed: ${crudResult.error}`);
      }
    } catch (error: any) {
      updateTestResult(5, 'error', `CRUD error: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: 'Testing...' })));

    try {
      await runGeminiTests();
      await runMongoDBTests();
    } catch (error) {
      console.error('Test suite error:', error);
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
    }
  };

  const successfulTests = tests.filter(t => t.status === 'success').length;
  const failedTests = tests.filter(t => t.status === 'error').length;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">API & Database Testing</h1>
          <p className="text-lg text-muted-foreground">
            Test Gemini API and MongoDB integration for NutriTrack
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successfulTests}</div>
              <p className="text-xs text-muted-foreground">out of {tests.length} tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <p className="text-xs text-muted-foreground">need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Status</CardTitle>
              <Database className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isRunning ? 'Running' : 'Ready'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isRunning ? 'Tests in progress...' : 'Click to start testing'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                API & Database Tests
              </CardTitle>
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="min-w-32"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-muted-foreground">{test.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">{test.duration}ms</span>
                    )}
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {failedTests > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              Some tests failed. Check the MongoDB connection and Gemini API key configuration.
              Make sure your MongoDB Atlas credentials are correct and network access is properly configured.
            </AlertDescription>
          </Alert>
        )}

        {successfulTests === tests.length && !isRunning && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              All tests passed! Your Gemini API and MongoDB Atlas integration is working perfectly.
            </AlertDescription>
          </Alert>
        )}

        {/* MongoDB Connection Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              MongoDB Atlas Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connection String:</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {browserMongoService.getConnectionInfo().maskedConnectionString || 'Not configured'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status:</p>
                  <Badge className={browserMongoService.getConnectionInfo().isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {browserMongoService.getConnectionInfo().isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Database:</p>
                  <p className="text-sm">nutritrack</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Collections:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {['users', 'meallogs', 'chatmessages', 'mealplans', 'challenges'].map((collection) => (
                    <Badge key={collection} variant="outline" className="text-xs">
                      {collection}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APITester;