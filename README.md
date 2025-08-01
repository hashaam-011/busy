# MCP CV & Email Server

A Model Context Protocol (MCP) server that can parse CVs/resumes and send email notifications, with an optional Next.js frontend for easy interaction.

## Features

- **CV Parsing**: Upload and parse PDF/TXT resumes to extract information
- **CV Chat**: Ask questions about your parsed CV (e.g., "What was my last position?")
- **Email Notifications**: Send emails via SMTP with customizable recipients, subjects, and content
- **Modern Web Interface**: Beautiful Next.js frontend with real-time chat and email functionality
- **MCP Protocol**: Full Model Context Protocol implementation for AI integration

## Project Structure

```
busy/
├── src/                    # MCP Server source code
│   ├── index.ts           # Main MCP server entry point
│   ├── cv-parser.ts       # CV parsing and question answering
│   ├── email-service.ts   # Email sending functionality
│   └── api-server.ts      # HTTP API server
├── frontend/              # Next.js web interface
│   ├── app/               # Next.js app directory
│   ├── package.json       # Frontend dependencies
│   └── ...
├── package.json           # Main server dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your SMTP settings:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Build and Run

```bash
# Build the server
npm run build

# Start the API server
npm start

# In another terminal, build and serve the frontend
cd frontend
npm run build
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Usage

### MCP Server

The MCP server provides three main tools:

1. **parse_cv**: Parse a CV file and extract information
2. **ask_cv_question**: Ask questions about the parsed CV
3. **send_email**: Send email notifications

### Web Interface

1. **Upload CV**: Drag and drop or click to upload your CV (PDF/TXT)
2. **Chat**: Ask questions about your CV using the chat interface
3. **Send Emails**: Use the email tab to send notifications

## API Endpoints

- `POST /api/parse-cv` - Upload and parse a CV file
- `POST /api/ask-cv-question` - Ask a question about the parsed CV
- `POST /api/send-email` - Send an email notification
- `GET /api/health` - Health check endpoint

## CV Parsing Features

The CV parser extracts:
- **Personal Information**: Name, email, phone
- **Work Experience**: Job titles, companies, durations
- **Skills**: Technical skills and technologies
- **Education**: Degrees, institutions, graduation years

## Email Configuration

The email service supports:
- **SMTP**: Gmail, Outlook, custom SMTP servers
- **Security**: TLS/SSL encryption
- **Templates**: Customizable email templates

## Development

### Running in Development Mode

```bash
# Start server in development
npm run dev

# Start frontend in development
cd frontend
npm run dev
```

### Testing

```bash
npm test
```

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Option 3: Railway/Heroku

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |

## Troubleshooting

### Email Issues
- Ensure SMTP credentials are correct
- Check if your email provider requires app passwords
- Verify firewall/network settings

### CV Parsing Issues
- Ensure file is PDF or TXT format
- Check file size (max 10MB)
- Verify file is not corrupted

### Frontend Issues
- Check if API server is running
- Verify CORS settings
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open an issue on GitHub or contact the development team.