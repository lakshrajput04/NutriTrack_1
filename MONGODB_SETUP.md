# MongoDB Setup Guide for NutriTrack

## Option 1: Local MongoDB Installation

### macOS (using Homebrew):
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Stop MongoDB service (when needed)
brew services stop mongodb/brew/mongodb-community
```

### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Start MongoDB as a Windows service

### Linux (Ubuntu):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list and install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: MongoDB Atlas (Cloud - Recommended)

### Setup Steps:
1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user with username/password
5. Add your IP address to the network access list (or allow access from anywhere: 0.0.0.0/0)
6. Get your connection string from "Connect" > "Connect your application"

### Update .env file:
```env
VITE_GEMINI_API_KEY=AIzaSyB14jj-FgZmdjtHRiZofzYh7o5_iBQWdcU
VITE_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/nutritrack?retryWrites=true&w=majority
```

## Option 3: Docker MongoDB

```bash
# Run MongoDB in Docker container
docker run --name nutritrack-mongo -p 27017:27017 -d mongo:latest

# Stop container
docker stop nutritrack-mongo

# Start container
docker start nutritrack-mongo
```

## Testing Your Setup

1. Start your MongoDB service (local or cloud)
2. Run the NutriTrack application:
   ```bash
   npm run dev
   ```
3. Navigate to http://localhost:8081/api-tester
4. Click "Run All Tests" to verify both Gemini API and MongoDB connections

## Database Structure

The application will automatically create these collections:
- `users` - User profiles and settings
- `meallogs` - Food tracking and meal analysis
- `chatmessages` - AI coach conversation history
- `mealplans` - Generated meal plans and recipes
- `challengeparticipations` - Community challenge data

## Connection String Examples

### Local MongoDB:
```
mongodb://localhost:27017/nutritrack
```

### MongoDB Atlas:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nutritrack?retryWrites=true&w=majority
```

### Docker MongoDB:
```
mongodb://localhost:27017/nutritrack
```

## Troubleshooting

### Common Issues:
1. **Connection refused**: Make sure MongoDB service is running
2. **Authentication failed**: Check username/password in connection string
3. **Network timeout**: Add your IP to MongoDB Atlas network access list
4. **SSL/TLS errors**: Use `ssl=true` in connection string for Atlas

### Verification Commands:
```bash
# Check if MongoDB is running (local)
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Test connection with MongoDB shell
mongosh "mongodb://localhost:27017/nutritrack"
```

## Next Steps

After setting up MongoDB:
1. Test the connection using the API Tester page
2. Create your user profile to start tracking
3. Use the meal analyzer to log your first meal
4. Chat with the AI coach for personalized advice
5. Generate your first meal plan

## Security Notes

- Never commit your .env file to version control
- Use strong passwords for database users
- Restrict network access in production
- Enable authentication for local MongoDB in production