// Browser-compatible MongoDB service simulation
// In a real application, this would be handled by a backend API

export interface MongoDBConnectionResult {
  success: boolean;
  message: string;
  connectionString?: string;
  error?: string;
}

export interface TestUser {
  _id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  createdAt: Date;
}

class BrowserMongoDBService {
  private connectionString: string;
  private isConnected = false;

  constructor() {
    this.connectionString = import.meta.env.VITE_MONGODB_URI || '';
  }

  // Simulate MongoDB connection test
  async testConnection(): Promise<MongoDBConnectionResult> {
    try {
      // Validate connection string format
      if (!this.connectionString) {
        return {
          success: false,
          message: 'MongoDB URI not provided in environment variables',
          error: 'Missing VITE_MONGODB_URI'
        };
      }

      if (!this.connectionString.startsWith('mongodb://') && !this.connectionString.startsWith('mongodb+srv://')) {
        return {
          success: false,
          message: 'Invalid MongoDB connection string format',
          error: 'URI must start with mongodb:// or mongodb+srv://'
        };
      }

      // Simulate connection test by parsing the URI
      const url = new URL(this.connectionString.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://'));
      
      if (!url.hostname) {
        return {
          success: false,
          message: 'Invalid hostname in connection string',
          error: 'Hostname not found'
        };
      }

      // In a real backend, this would actually connect to MongoDB
      // For demo purposes, we simulate a successful connection
      this.isConnected = true;
      
      return {
        success: true,
        message: `Connection string validated for ${url.hostname}`,
        connectionString: this.connectionString.replace(/:([^:@]+)@/, ':****@') // Hide password
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'Connection test failed',
        error: error.message
      };
    }
  }

  // Simulate CRUD operations
  async testCRUDOperations(): Promise<{ success: boolean; message: string; user?: TestUser; error?: string }> {
    try {
      if (!this.isConnected) {
        const connectionResult = await this.testConnection();
        if (!connectionResult.success) {
          return {
            success: false,
            message: 'Cannot perform CRUD operations without connection',
            error: connectionResult.error
          };
        }
      }

      // Simulate creating a test user
      const testUser: TestUser = {
        _id: new Date().getTime().toString(),
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        age: 25,
        weight: 70,
        height: 175,
        createdAt: new Date()
      };

      // In a real backend, this would save to MongoDB
      // For demo, we simulate successful save
      console.log('Simulated user creation:', testUser);

      return {
        success: true,
        message: `CRUD operations simulated successfully`,
        user: testUser
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'CRUD operations failed',
        error: error.message
      };
    }
  }

  // Get connection info for display
  getConnectionInfo(): { 
    isConnected: boolean; 
    connectionString: string; 
    maskedConnectionString: string;
  } {
    const masked = this.connectionString.replace(/:([^:@]+)@/, ':****@');
    return {
      isConnected: this.isConnected,
      connectionString: this.connectionString,
      maskedConnectionString: masked
    };
  }

  // Simulate getting database collections info
  async getDatabaseInfo(): Promise<{
    collections: string[];
    estimatedUsers: number;
    lastActivity: Date;
  }> {
    // Simulate database info
    return {
      collections: ['users', 'meallogs', 'chatmessages', 'mealplans', 'challengeparticipations'],
      estimatedUsers: Math.floor(Math.random() * 1000) + 100,
      lastActivity: new Date()
    };
  }
}

export const browserMongoService = new BrowserMongoDBService();