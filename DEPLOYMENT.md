# Deployment Guide

This guide covers deploying the MCP CV & Email Server to various platforms.

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Environment Variables**: Configure SMTP settings
3. **Domain (Optional)**: For production deployments

## Deployment Options

### 1. Vercel (Recommended for Frontend)

**Frontend Deployment:**
1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set build settings:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your API server URL
5. Deploy

**Backend Deployment:**
- Use Railway, Heroku, or DigitalOcean (see below)

### 2. Railway

1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   PORT=3001
   NODE_ENV=production
   ```
4. Deploy

### 3. Heroku

1. Install Heroku CLI
2. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set SMTP_HOST=smtp.gmail.com
   heroku config:set SMTP_PORT=587
   heroku config:set SMTP_USER=your-email@gmail.com
   heroku config:set SMTP_PASS=your-app-password
   heroku config:set NODE_ENV=production
   ```
4. Deploy:
   ```bash
   git push heroku main
   ```

### 4. DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create new app from GitHub repository
3. Configure:
   - Source: GitHub repository
   - Branch: main
   - Build Command: `npm run build`
   - Run Command: `npm start`
4. Set environment variables in the dashboard
5. Deploy

### 5. Docker Deployment

**Local Docker:**
```bash
# Build and run with docker-compose
docker-compose up --build
```

**Docker on Server:**
```bash
# Build image
docker build -t mcp-cv-server .

# Run container
docker run -p 3001:3001 \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASS=your-app-password \
  mcp-cv-server
```

### 6. AWS EC2

1. Launch EC2 instance
2. Install Docker:
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```
3. Clone repository and deploy:
   ```bash
   git clone <your-repo>
   cd <your-repo>
   docker-compose up -d
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your-app-password` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | `http://localhost:3001` |

## SMTP Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate app password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use app password in `SMTP_PASS`

### Outlook Setup
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Custom SMTP
```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## SSL/HTTPS Setup

### Vercel
- Automatic SSL with custom domains
- Configure in Vercel dashboard

### Railway
- Automatic SSL
- Custom domains supported

### Heroku
- Automatic SSL with paid plans
- Custom domains: `heroku certs:auto:enable`

### DigitalOcean
- Automatic SSL with App Platform
- Custom domains in dashboard

## Monitoring & Logs

### Railway
- Built-in logging dashboard
- Real-time logs: `railway logs`

### Heroku
- View logs: `heroku logs --tail`
- Add-ons for monitoring

### Docker
- View logs: `docker logs <container-id>`
- Monitor: `docker stats`

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify firewall settings
   - Test with different SMTP provider

2. **Frontend can't connect to API**
   - Check CORS settings
   - Verify API URL in environment
   - Ensure API server is running

3. **CV parsing fails**
   - Check file format (PDF/TXT only)
   - Verify file size limits
   - Check file encoding

4. **Build failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies installed
   - Check TypeScript compilation

### Debug Commands

```bash
# Check server health
curl http://localhost:3001/api/health

# Test CV parsing
curl -X POST -F "cv=@sample-cv.txt" http://localhost:3001/api/parse-cv

# Test email (replace with your config)
curl -X POST -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Test"}' \
  http://localhost:3001/api/send-email
```

## Performance Optimization

1. **Enable compression**
2. **Use CDN for static assets**
3. **Implement caching**
4. **Monitor memory usage**
5. **Scale horizontally if needed**

## Security Considerations

1. **Environment variables**: Never commit secrets
2. **CORS**: Configure properly for production
3. **Rate limiting**: Implement for API endpoints
4. **Input validation**: Validate all inputs
5. **File upload limits**: Set appropriate limits
6. **HTTPS**: Always use in production

## Backup Strategy

1. **Database**: Regular backups if using database
2. **Files**: Backup uploaded files
3. **Configuration**: Version control environment configs
4. **Monitoring**: Set up alerts for failures