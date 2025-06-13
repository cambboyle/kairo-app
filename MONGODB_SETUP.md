# MongoDB Atlas Setup for Kairo

## 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Sandbox is free)

## 2. Set Up Database Access

1. In your MongoDB Atlas dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Add "Built-in Role" → "Atlas Admin" or "Read and write to any database"
6. Click "Add User"

## 3. Set Up Network Access

1. Go to "Network Access" in the sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses or use Vercel's IP ranges

## 4. Get Connection String

1. Go to "Clusters" in the sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver and latest version
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 5. Configure Environment Variables

### For Local Development:
Update your `.env` file:
```env
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/kairo?retryWrites=true&w=majority
```

### For Vercel Production:
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add a new environment variable:
   - **Name**: `MONGO_URI`
   - **Value**: `mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/kairo?retryWrites=true&w=majority`
   - **Environment**: Production (and optionally Preview/Development)

## 6. Test the Connection

Once deployed, test your API endpoints:

1. **Health Check**: `https://your-app.vercel.app/api/health`
2. **Get Sessions**: `https://your-app.vercel.app/api/sessions`
3. **Create Session**: POST to `https://your-app.vercel.app/api/sessions`

## Security Notes

- Never commit your actual MongoDB credentials to git
- Use strong, unique passwords
- Consider using MongoDB's IP whitelist for production
- Regularly rotate database credentials

## Database Schema

The app uses this session schema:
```javascript
{
  type: String,        // Session type (focus, break, etc.)
  duration: Number,    // Duration in minutes
  startTime: Date,     // When the session started
  endTime: Date,       // When the session ended
  notes: String,       // User notes
  reflection: String,  // User reflection
  mood: String,        // User mood
  timestamps: true     // Auto-generated createdAt/updatedAt
}
```
