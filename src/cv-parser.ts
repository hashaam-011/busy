import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

export interface CVData {
  name?: string;
  email?: string;
  phone?: string;
  positions?: WorkPosition[];
  skills?: string[];
  education?: Education[];
  rawText: string;
}

export interface WorkPosition {
  title: string;
  company: string;
  duration?: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
}

export class CVParser {
  private cvData: CVData | null = null;

  async parseCV(filePath: string): Promise<CVData> {
    const fileExtension = path.extname(filePath).toLowerCase();
    let rawText: string;

    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      rawText = pdfData.text;
    } else if (fileExtension === '.txt') {
      rawText = fs.readFileSync(filePath, 'utf-8');
    } else {
      throw new Error('Unsupported file format. Please use PDF or TXT files.');
    }

    this.cvData = this.extractCVData(rawText);
    return this.cvData;
  }

  private extractCVData(rawText: string): CVData {
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const cvData: CVData = {
      rawText,
      positions: [],
      skills: [],
      education: []
    };

    // Extract basic information
    cvData.name = this.extractName(lines);
    cvData.email = this.extractEmail(rawText);
    cvData.phone = this.extractPhone(rawText);

    // Extract work positions
    cvData.positions = this.extractWorkPositions(lines);

    // Extract skills
    cvData.skills = this.extractSkills(rawText);

    // Extract education
    cvData.education = this.extractEducation(lines);

    return cvData;
  }

  private extractName(lines: string[]): string | undefined {
    // Look for name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.match(/^[A-Z][a-z]+ [A-Z][a-z]+/) && !line.includes('@')) {
        return line;
      }
    }
    return undefined;
  }

  private extractEmail(text: string): string | undefined {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : undefined;
  }

  private extractPhone(text: string): string | undefined {
    const phoneRegex = /(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/;
    const match = text.match(phoneRegex);
    return match ? match[0] : undefined;
  }

  private extractWorkPositions(lines: string[]): WorkPosition[] {
    const positions: WorkPosition[] = [];
    const workKeywords = ['experience', 'work', 'employment', 'job', 'position', 'role'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (workKeywords.some(keyword => line.includes(keyword))) {
        // Look for position details in subsequent lines
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const nextLine = lines[j];

          // Look for company names (usually in caps or with common suffixes)
          if (nextLine.match(/^[A-Z][A-Z\s&]+$/) ||
              nextLine.includes('Inc') ||
              nextLine.includes('Corp') ||
              nextLine.includes('LLC') ||
              nextLine.includes('Ltd')) {

            // Look for job title in previous lines
            let title = '';
            for (let k = j - 1; k >= Math.max(0, j - 3); k--) {
              if (lines[k] && !lines[k].match(/^[A-Z][A-Z\s&]+$/)) {
                title = lines[k];
                break;
              }
            }

            if (title && nextLine) {
              positions.push({
                title: title.trim(),
                company: nextLine.trim(),
                duration: this.extractDuration(lines, j + 1)
              });
            }
          }
        }
      }
    }

    return positions;
  }

  private extractDuration(lines: string[], startIndex: number): string | undefined {
    for (let i = startIndex; i < Math.min(startIndex + 3, lines.length); i++) {
      const line = lines[i];
      if (line.match(/\d{4}/) || line.includes('Present') || line.includes('Current')) {
        return line.trim();
      }
    }
    return undefined;
  }

  private extractSkills(text: string): string[] {
    const skills: string[] = [];
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Node.js', 'Angular',
      'Vue.js', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'GraphQL', 'REST', 'API', 'Git', 'GitHub', 'CI/CD',
      'Agile', 'Scrum', 'JIRA', 'Confluence', 'Figma', 'Adobe', 'Photoshop'
    ];

    for (const skill of skillKeywords) {
      if (text.includes(skill)) {
        skills.push(skill);
      }
    }

    return skills;
  }

  private extractEducation(lines: string[]): Education[] {
    const education: Education[] = [];
    const eduKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (eduKeywords.some(keyword => line.includes(keyword))) {
        // Look for degree and institution in subsequent lines
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j];

          if (nextLine.includes('University') ||
              nextLine.includes('College') ||
              nextLine.includes('Institute') ||
              nextLine.includes('School')) {

            let degree = '';
            for (let k = j - 1; k >= Math.max(0, j - 2); k--) {
              if (lines[k] && !lines[k].includes('University') && !lines[k].includes('College')) {
                degree = lines[k];
                break;
              }
            }

            if (degree && nextLine) {
              education.push({
                degree: degree.trim(),
                institution: nextLine.trim(),
                year: this.extractYear(lines, j + 1)
              });
            }
          }
        }
      }
    }

    return education;
  }

  private extractYear(lines: string[], startIndex: number): string | undefined {
    for (let i = startIndex; i < Math.min(startIndex + 3, lines.length); i++) {
      const line = lines[i];
      if (line.match(/\d{4}/)) {
        return line.trim();
      }
    }
    return undefined;
  }

  async askQuestion(question: string): Promise<string> {
    if (!this.cvData) {
      throw new Error('No CV data available. Please parse a CV first.');
    }

    const lowerQuestion = question.toLowerCase();

    // Handle different types of questions
    if (lowerQuestion.includes('last position') || lowerQuestion.includes('last role') || lowerQuestion.includes('current position')) {
      if (this.cvData.positions && this.cvData.positions.length > 0) {
        const lastPosition = this.cvData.positions[0];
        return `Your last position was ${lastPosition.title} at ${lastPosition.company}${lastPosition.duration ? ` (${lastPosition.duration})` : ''}.`;
      }
      return "I couldn't find any work positions in your CV.";
    }

    if (lowerQuestion.includes('experience') || lowerQuestion.includes('positions')) {
      if (this.cvData.positions && this.cvData.positions.length > 0) {
        const positions = this.cvData.positions.map(pos =>
          `${pos.title} at ${pos.company}${pos.duration ? ` (${pos.duration})` : ''}`
        ).join(', ');
        return `Your work experience includes: ${positions}`;
      }
      return "I couldn't find any work experience in your CV.";
    }

    if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology')) {
      if (this.cvData.skills && this.cvData.skills.length > 0) {
        return `Your skills include: ${this.cvData.skills.join(', ')}`;
      }
      return "I couldn't find any specific skills listed in your CV.";
    }

    if (lowerQuestion.includes('education') || lowerQuestion.includes('degree')) {
      if (this.cvData.education && this.cvData.education.length > 0) {
        const education = this.cvData.education.map(edu =>
          `${edu.degree} from ${edu.institution}${edu.year ? ` (${edu.year})` : ''}`
        ).join(', ');
        return `Your education includes: ${education}`;
      }
      return "I couldn't find any education information in your CV.";
    }

    if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('phone')) {
      const contactInfo = [];
      if (this.cvData.email) contactInfo.push(`Email: ${this.cvData.email}`);
      if (this.cvData.phone) contactInfo.push(`Phone: ${this.cvData.phone}`);

      if (contactInfo.length > 0) {
        return `Your contact information: ${contactInfo.join(', ')}`;
      }
      return "I couldn't find any contact information in your CV.";
    }

    // Default response for other questions
    return "I can answer questions about your work experience, skills, education, and contact information. Please ask a specific question about your CV.";
  }
}