/**
 * Python Service
 * Interface for calling Python subtitle processing scripts
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger';
import { configService } from './config.service';

const execAsync = promisify(exec);

export interface PythonProcessingOptions {
  removeTimestamps: boolean;
  mergeDuplicates: boolean;
  formatParagraphs: boolean;
  minSegmentLength?: number;
  languageCode?: string;
}

export interface PythonProcessingResult {
  success: boolean;
  inputFile: string;
  outputFile: string;
  stats: {
    originalSegments: number;
    processedSegments: number;
    removedDuplicates: number;
    totalCharacters: number;
    totalWords: number;
    processingTime: number;
  };
  error?: string;
}

export class PythonService {
  private readonly pythonPath: string;
  private readonly scriptPath: string;
  private readonly timeout: number;

  constructor() {
    this.pythonPath = configService.getProcessingConfig().pythonPath;
    this.scriptPath = configService.getProcessingConfig().cleaningScriptPath;
    this.timeout = configService.getProcessingConfig().processingTimeout;
  }

  /**
   * Check if Python is available and the script exists
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Check Python availability
      const { stdout } = await execAsync(`"${this.pythonPath}" --version`);
      logger.info('Python is available', { version: stdout.trim() });

      // Check script existence
      const { stdout: scriptCheck } = await execAsync(`test -f "${this.scriptPath}" && echo "exists"`);
      if (scriptCheck.trim() === 'exists') {
        logger.info('Python script is available', { scriptPath: this.scriptPath });
        return true;
      } else {
        logger.error('Python script not found', { scriptPath: this.scriptPath });
        return false;
      }
    } catch (error) {
      logger.error('Python service not available', error);
      return false;
    }
  }

  /**
   * Get Python version
   */
  async getPythonVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync(`"${this.pythonPath}" --version`);
      return stdout.trim();
    } catch (error) {
      logger.error('Failed to get Python version', error);
      throw new Error('Python not available');
    }
  }

  /**
   * Process subtitle file using Python script
   * @param inputFile - Path to input JSON3 subtitle file
   * @param outputFile - Path to output text file
   * @param options - Processing options
   * @returns Promise<PythonProcessingResult> - Processing result
   */
  async processSubtitles(
    inputFile: string,
    outputFile: string,
    options: PythonProcessingOptions
  ): Promise<PythonProcessingResult> {
    logger.info('Starting Python subtitle processing', {
      inputFile,
      outputFile,
      options
    });

    const startTime = Date.now();

    try {
      // Build command arguments
      const args = [
        this.scriptPath,
        '--input', inputFile,
        '--output', outputFile
      ];

      // Add options
      if (options.removeTimestamps) {
        args.push('--remove-timestamps');
      }

      if (options.mergeDuplicates) {
        args.push('--merge-duplicates');
      }

      if (options.formatParagraphs) {
        args.push('--format-paragraphs');
      }

      if (options.minSegmentLength !== undefined) {
        args.push('--min-segment-length', options.minSegmentLength.toString());
      }

      if (options.languageCode) {
        args.push('--language-code', options.languageCode);
      }

      // Execute Python script
      const result = await this.executePythonScript(args);

      const processingTime = (Date.now() - startTime) / 1000;

      if (result.success) {
        logger.info('Python subtitle processing completed successfully', {
          inputFile,
          outputFile,
          processingTime,
          stats: result.stats
        });

        return {
          ...result,
          processingTime
        };
      } else {
        throw new Error(result.error || 'Unknown Python script error');
      }
    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;
      logger.error('Python subtitle processing failed', {
        inputFile,
        error,
        processingTime
      });

      return {
        success: false,
        inputFile,
        outputFile,
        stats: {
          originalSegments: 0,
          processedSegments: 0,
          removedDuplicates: 0,
          totalCharacters: 0,
          totalWords: 0,
          processingTime
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute Python script and capture output
   */
  private async executePythonScript(args: string[]): Promise<PythonProcessingResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const child = spawn(this.pythonPath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Python script timeout after ${this.timeout}ms`));
      }, this.timeout);

      // Capture stdout
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      // Capture stderr
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      child.on('close', (code) => {
        clearTimeout(timeoutId);

        const processingTime = (Date.now() - startTime) / 1000;

        if (code === 0) {
          // Success - parse result from stdout
          try {
            const result = this.parsePythonOutput(stdout, args);
            resolve(result);
          } catch (parseError) {
            logger.error('Failed to parse Python script output', { stdout, parseError });
            reject(new Error('Failed to parse Python script output'));
          }
        } else {
          // Error
          const errorMessage = stderr.trim() || `Python script exited with code ${code}`;
          logger.error('Python script failed', { code, stderr: errorMessage });
          reject(new Error(errorMessage));
        }
      });

      // Handle process error
      child.on('error', (error) => {
        clearTimeout(timeoutId);
        logger.error('Python script process error', error);
        reject(error);
      });
    });
  }

  /**
   * Parse Python script output to extract processing result
   */
  private parsePythonOutput(output: string, args: string[]): PythonProcessingResult {
    const lines = output.split('\n');

    // Extract input and output files from arguments
    const inputIndex = args.indexOf('--input');
    const outputIndex = args.indexOf('--output');
    const inputFile = inputIndex !== -1 ? args[inputIndex + 1] : '';
    const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : '';

    // Default stats
    const stats = {
      originalSegments: 0,
      processedSegments: 0,
      removedDuplicates: 0,
      totalCharacters: 0,
      totalWords: 0,
      processingTime: 0
    };

    // Parse processing summary from output
    const summaryMatch = output.match(/📊 Processing Summary:/);
    if (summaryMatch) {
      const summaryIndex = output.indexOf(summaryMatch[0]);
      const summaryText = output.substring(summaryIndex);

      // Extract individual stats
      const segmentsMatch = summaryText.match(/Original segments: (\d+)/);
      if (segmentsMatch) {
        stats.originalSegments = parseInt(segmentsMatch[1]);
      }

      const processedMatch = summaryText.match(/Processed segments: (\d+)/);
      if (processedMatch) {
        stats.processedSegments = parseInt(processedMatch[1]);
      }

      const duplicatesMatch = summaryText.match(/Duplicates removed: (\d+)/);
      if (duplicatesMatch) {
        stats.removedDuplicates = parseInt(duplicatesMatch[1]);
      }

      const charactersMatch = summaryText.match(/Total characters: (\d+)/);
      if (charactersMatch) {
        stats.totalCharacters = parseInt(charactersMatch[1]);
      }

      const wordsMatch = summaryText.match(/Total words: (\d+)/);
      if (wordsMatch) {
        stats.totalWords = parseInt(wordsMatch[1]);
      }

      const timeMatch = summaryText.match(/Processing time: ([\d.]+) seconds/);
      if (timeMatch) {
        stats.processingTime = parseFloat(timeMatch[1]);
      }
    }

    return {
      success: true,
      inputFile,
      outputFile,
      stats
    };
  }

  /**
   * Get script help information
   */
  async getScriptHelp(): Promise<string> {
    try {
      const { stdout } = await execAsync(`"${this.pythonPath}" "${this.scriptPath}" --help`);
      return stdout;
    } catch (error) {
      logger.error('Failed to get script help', error);
      throw new Error('Failed to get script help');
    }
  }

  /**
   * Validate script functionality with a test case
   */
  async validateScript(): Promise<boolean> {
    try {
      // Create a minimal test JSON3 content
      const testContent = {
        events: [
          {
            tStartMs: 1000,
            dDurationMs: 3000,
            aAppend: 1,
            segs: [
              { utf8: "Hello, world!" }
            ]
          }
        ]
      };

      // Write test file
      const testInputPath = '/tmp/test_input.json3';
      const testOutputPath = '/tmp/test_output.txt';

      await this.writeTestFile(testInputPath, JSON.stringify(testContent));

      // Process test file
      const result = await this.processSubtitles(testInputPath, testOutputPath, {
        removeTimestamps: true,
        mergeDuplicates: true,
        formatParagraphs: true
      });

      // Clean up test files
      await this.cleanupTestFiles([testInputPath, testOutputPath]);

      return result.success;
    } catch (error) {
      logger.error('Script validation failed', error);
      return false;
    }
  }

  /**
   * Write test file for validation
   */
  private async writeTestFile(filePath: string, content: string): Promise<void> {
    const { writeFile } = require('fs').promises;
    await writeFile(filePath, content, 'utf-8');
  }

  /**
   * Clean up test files
   */
  private async cleanupTestFiles(filePaths: string[]): Promise<void> {
    const { unlink } = require('fs').promises;

    for (const filePath of filePaths) {
      try {
        await unlink(filePath);
      } catch (error) {
        // Ignore file not found errors
      }
    }
  }
}