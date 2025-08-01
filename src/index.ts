import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { CVParser } from './cv-parser.js';
import { EmailService } from './email-service.js';

class CVEmailMCPServer {
  private server: Server;
  private cvParser: CVParser;
  private emailService: EmailService;

  constructor() {
    this.server = new Server(
      {
        name: 'cv-email-mcp-server',
        version: '1.0.0',
      }
    );

    this.cvParser = new CVParser();
    this.emailService = new EmailService();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'parse_cv',
            description: 'Parse a CV/resume file and extract information',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: 'Path to the CV file (PDF or text)',
                },
              },
              required: ['file_path'],
            },
          },
          {
            name: 'ask_cv_question',
            description: 'Ask a question about the parsed CV content',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'Question about the CV (e.g., "What was my last role?")',
                },
              },
              required: ['question'],
            },
          },
          {
            name: 'send_email',
            description: 'Send an email notification',
            inputSchema: {
              type: 'object',
              properties: {
                to: {
                  type: 'string',
                  description: 'Recipient email address',
                },
                subject: {
                  type: 'string',
                  description: 'Email subject',
                },
                body: {
                  type: 'string',
                  description: 'Email body content',
                },
              },
              required: ['to', 'subject', 'body'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'parse_cv':
          return await this.handleParseCV(args as { file_path: string });

        case 'ask_cv_question':
          return await this.handleAskCVQuestion(args as { question: string });

        case 'send_email':
          return await this.handleSendEmail(args as {
            to: string;
            subject: string;
            body: string;
          });

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handleParseCV(args: { file_path: string }) {
    try {
      const cvData = await this.cvParser.parseCV(args.file_path);
      return {
        content: [
          {
            type: 'text',
            text: `CV parsed successfully. Found ${cvData.positions?.length || 0} positions and ${cvData.skills?.length || 0} skills.`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to parse CV: ${error}`);
    }
  }

  private async handleAskCVQuestion(args: { question: string }) {
    try {
      const answer = await this.cvParser.askQuestion(args.question);
      return {
        content: [
          {
            type: 'text',
            text: answer,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to answer CV question: ${error}`);
    }
  }

  private async handleSendEmail(args: {
    to: string;
    subject: string;
    body: string;
  }) {
    try {
      await this.emailService.sendEmail(args.to, args.subject, args.body);
      return {
        content: [
          {
            type: 'text',
            text: `Email sent successfully to ${args.to}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('MCP Server started on stdio');
  }
}

// Start the server
const server = new CVEmailMCPServer();
server.run().catch(console.error);