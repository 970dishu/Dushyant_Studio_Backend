# Dushyant Studio - Backend Server

Node.js/Express backend server for handling contact form submissions using Nodemailer.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your SMTP credentials:

```bash
cp .env.example .env
```

#### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password in `.env`

Example `.env`:
```env
PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your-16-char-app-password
RECIPIENT_EMAIL=dushyantdishugarg@gmail.com
```

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST `/api/contact`
Submit contact form data.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "service": "Motion Design",
  "message": "I'd like to discuss a project..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Deployment on Azure VM

### 1. Install Node.js on Azure VM
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Upload Server Files
Upload the `server` folder to your Azure VM.

### 3. Install Dependencies
```bash
cd server
npm install --production
```

### 4. Set Up Environment Variables
Create `.env` file with your production SMTP credentials.

### 5. Use PM2 for Process Management
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the server
pm2 start index.js --name dushyant-studio-api

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

### 6. Configure Nginx as Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Enable Firewall
```bash
sudo ufw allow 3001/tcp
sudo ufw enable
```

## Testing

Test the API using curl:
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "service": "Motion Design",
    "message": "This is a test message"
  }'
```

## Troubleshooting

### Email not sending
- Verify SMTP credentials in `.env`
- Check if 2FA is enabled and using App Password (for Gmail)
- Check firewall settings on Azure VM
- Review server logs: `pm2 logs dushyant-studio-api`

### CORS errors
- Update CORS configuration in `index.js` to include your frontend domain
- For production, replace `cors()` with specific origin:
```javascript
app.use(cors({
  origin: 'https://your-domain.com'
}));
```
