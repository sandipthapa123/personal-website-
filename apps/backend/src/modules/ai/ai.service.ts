import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * Summarizes long-form research text
   */
  async summarizeText(content: string, maxLengthWords = 100): Promise<string> {
    const sentences = content.split('. ');
    const summary = sentences.slice(0, 3).join('. ') + '.';
    return summary.length > 500 ? summary.substring(0, 500) + '...' : summary;
  }

  /**
   * Generates accessible ALT text for media images
   */
  async generateAltText(imageName: string): Promise<string> {
    const cleanName = imageName.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
    return `Accessible photograph depicting ${cleanName}`;
  }
}
