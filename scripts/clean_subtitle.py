#!/usr/bin/env python3
"""
YouTube Subtitle Cleaning Script
Converts JSON3 subtitle format to clean plain text

Usage:
    python clean_subtitle.py --input INPUT_FILE --output OUTPUT_FILE [options]

Options:
    --input FILE           Input JSON3 subtitle file (required)
    --output FILE          Output plain text file (required)
    --remove-timestamps    Remove all timestamp information (default: True)
    --merge-duplicates     Merge duplicate consecutive segments (default: True)
    --format-paragraphs    Format text into paragraphs (default: True)
    --min-segment-length   Minimum segment length to keep (default: 10)
    --language-code        Language code for special processing (optional)
    --verbose              Enable verbose output
    --help                 Show this help message
"""

import json
import argparse
import sys
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class SubtitleCleaner:
    """Cleans and processes JSON3 subtitle files"""

    def __init__(self):
        self.stats = {
            'original_segments': 0,
            'processed_segments': 0,
            'removed_duplicates': 0,
            'removed_timestamps': 0,
            'total_characters': 0,
            'total_words': 0,
            'processing_time': 0
        }

    def load_json3_file(self, file_path: str) -> Dict[str, Any]:
        """Load and parse JSON3 subtitle file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if 'events' not in data:
                raise ValueError("Invalid JSON3 format: missing 'events' field")

            logger.info(f"Loaded JSON3 file: {file_path}")
            logger.info(f"Found {len(data['events'])} subtitle events")

            return data
        except Exception as e:
            logger.error(f"Failed to load JSON3 file {file_path}: {e}")
            raise

    def extract_text_segments(self, data: Dict[str, Any]) -> List[str]:
        """Extract text segments from JSON3 events"""
        segments = []
        events = data.get('events', [])

        for event in events:
            if 'segs' in event:
                for seg in event['segs']:
                    if 'utf8' in seg and seg['utf8'].strip():
                        segments.append(seg['utf8'].strip())

        self.stats['original_segments'] = len(segments)
        logger.info(f"Extracted {len(segments)} text segments")

        return segments

    def remove_duplicates(self, segments: List[str]) -> List[str]:
        """Remove duplicate consecutive segments"""
        if not segments:
            return segments

        cleaned = [segments[0]]
        duplicates_removed = 0

        for i in range(1, len(segments)):
            if segments[i] != segments[i-1]:
                cleaned.append(segments[i])
            else:
                duplicates_removed += 1

        self.stats['removed_duplicates'] = duplicates_removed
        logger.info(f"Removed {duplicates_removed} duplicate segments")

        return cleaned

    def merge_consecutive_segments(self, segments: List[str], min_length: int = 10) -> List[str]:
        """Merge short consecutive segments with the next one"""
        if not segments:
            return segments

        merged = []
        i = 0

        while i < len(segments):
            current = segments[i]

            # If current segment is too short and there's a next segment
            if (len(current) < min_length and i + 1 < len(segments)):
                # Merge with next segment
                merged.append(current + ' ' + segments[i + 1])
                i += 2  # Skip the next segment as it's been merged
            else:
                merged.append(current)
                i += 1

        logger.info(f"Merged segments from {len(segments)} to {len(merged)}")

        return merged

    def format_paragraphs(self, segments: List[str]) -> str:
        """Format segments into paragraphs"""
        # Simple paragraph formation based on sentence endings
        text = ' '.join(segments)

        # Ensure proper spacing around punctuation
        text = re.sub(r'\s+([.!?])', r'\1', text)
        text = re.sub(r'([.!?])(\w)', r'\1 \2', text)

        # Split into paragraphs (simple heuristic: two or more sentences)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        paragraphs = []
        current_paragraph = []

        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                current_paragraph.append(sentence)

                # End paragraph after 2-4 sentences or if sentence ends with common paragraph indicators
                if (len(current_paragraph) >= 3 and
                    (sentence.endswith(('.', '?', '!')) or
                     any(indicator in sentence.lower() for indicator in ['however', 'therefore', 'moreover', 'furthermore']))):
                    paragraphs.append(' '.join(current_paragraph))
                    current_paragraph = []

        # Add remaining sentences
        if current_paragraph:
            paragraphs.append(' '.join(current_paragraph))

        result = '\n\n'.join(paragraphs)
        logger.info(f"Formatted {len(segments)} segments into {len(paragraphs)} paragraphs")

        return result

    def clean_text(self, text: str, language_code: Optional[str] = None) -> str:
        """Clean and normalize text"""
        # Remove common subtitle artifacts
        text = re.sub(r'\[.*?\]', '', text)  # Remove bracketed text like [music]
        text = re.sub(r'\(.*?\)', '', text)  # Remove parenthesized text
        text = re.sub(r'<.*?>', '', text)    # Remove HTML-like tags

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)

        # Remove extra spaces at beginning and end
        text = text.strip()

        # Language-specific cleaning
        if language_code:
            text = self._language_specific_cleaning(text, language_code)

        return text

    def _language_specific_cleaning(self, text: str, language_code: str) -> str:
        """Apply language-specific text cleaning"""
        if language_code == 'zh':
            # Chinese text processing
            # Remove unnecessary spaces between Chinese characters
            text = re.sub(r'([\u4e00-\u9fff])\s+([\u4e00-\u9fff])', r'\1\2', text)
            # Ensure proper spacing between Chinese and English/numbers
            text = re.sub(r'([\u4e00-\u9fff])([a-zA-Z0-9])', r'\1 \2', text)
            text = re.sub(r'([a-zA-Z0-9])([\u4e00-\u9fff])', r'\1 \2', text)

        elif language_code == 'ja':
            # Japanese text processing
            # Remove unnecessary spaces between Japanese characters
            text = re.sub(r'([\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff])\s+([\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff])', r'\1\2', text)

        elif language_code == 'ko':
            # Korean text processing
            # Normalize Korean spacing
            text = re.sub(r'([가-힣])\s+([가-힣])', r'\1\2', text)

        return text

    def process_file(self, input_file: str, output_file: str, **kwargs) -> Dict[str, Any]:
        """Process subtitle file and save cleaned text"""
        start_time = datetime.now()

        try:
            # Load JSON3 file
            data = self.load_json3_file(input_file)

            # Extract text segments
            segments = self.extract_text_segments(data)

            # Remove duplicates if requested
            if kwargs.get('merge_duplicates', True):
                segments = self.remove_duplicates(segments)

            # Merge short segments if requested
            min_length = kwargs.get('min_segment_length', 10)
            if min_length > 0:
                segments = self.merge_consecutive_segments(segments, min_length)

            # Format paragraphs if requested
            if kwargs.get('format_paragraphs', True):
                text = self.format_paragraphs(segments)
            else:
                text = ' '.join(segments)

            # Clean text
            language_code = kwargs.get('language_code')
            text = self.clean_text(text, language_code)

            # Calculate statistics
            self.stats['processed_segments'] = len(segments)
            self.stats['total_characters'] = len(text)
            self.stats['total_words'] = len(text.split())

            # Save to output file
            self._save_output_file(output_file, text)

            # Calculate processing time
            end_time = datetime.now()
            self.stats['processing_time'] = (end_time - start_time).total_seconds()

            logger.info(f"Processing completed in {self.stats['processing_time']:.2f} seconds")
            logger.info(f"Output: {self.stats['total_characters']} characters, {self.stats['total_words']} words")

            return {
                'success': True,
                'stats': self.stats,
                'output_file': output_file,
                'input_file': input_file
            }

        except Exception as e:
            logger.error(f"Processing failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'stats': self.stats
            }

    def _save_output_file(self, file_path: str, content: str):
        """Save content to output file"""
        try:
            output_path = Path(file_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            logger.info(f"Saved cleaned text to: {file_path}")

        except Exception as e:
            logger.error(f"Failed to save output file {file_path}: {e}")
            raise


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Clean and process JSON3 subtitle files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s --input subtitle.json3 --output cleaned.txt
    %(prog)s --input subtitle.json3 --output cleaned.txt --language-code zh
    %(prog)s --input subtitle.json3 --output cleaned.txt --no-format-paragraphs
        """
    )

    parser.add_argument(
        '--input', '-i',
        required=True,
        help='Input JSON3 subtitle file'
    )

    parser.add_argument(
        '--output', '-o',
        required=True,
        help='Output plain text file'
    )

    parser.add_argument(
        '--remove-timestamps',
        action='store_true',
        default=True,
        help='Remove all timestamp information (default: True)'
    )

    parser.add_argument(
        '--merge-duplicates',
        action='store_true',
        default=True,
        help='Merge duplicate consecutive segments (default: True)'
    )

    parser.add_argument(
        '--format-paragraphs',
        action='store_true',
        default=True,
        help='Format text into paragraphs (default: True)'
    )

    parser.add_argument(
        '--min-segment-length',
        type=int,
        default=10,
        help='Minimum segment length to keep (default: 10)'
    )

    parser.add_argument(
        '--language-code',
        help='Language code for special processing (e.g., zh, en, ja)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Validate input file
    if not Path(args.input).exists():
        logger.error(f"Input file does not exist: {args.input}")
        sys.exit(1)

    # Create cleaner and process file
    cleaner = SubtitleCleaner()

    processing_options = {
        'remove_timestamps': args.remove_timestamps,
        'merge_duplicates': args.merge_duplicates,
        'format_paragraphs': args.format_paragraphs,
        'min_segment_length': args.min_segment_length,
        'language_code': args.language_code
    }

    result = cleaner.process_file(args.input, args.output, **processing_options)

    if result['success']:
        logger.info("Processing completed successfully!")

        # Print summary
        stats = result['stats']
        print(f"\n📊 Processing Summary:")
        print(f"   Input file: {result['input_file']}")
        print(f"   Output file: {result['output_file']}")
        print(f"   Original segments: {stats['original_segments']}")
        print(f"   Processed segments: {stats['processed_segments']}")
        print(f"   Duplicates removed: {stats['removed_duplicates']}")
        print(f"   Total characters: {stats['total_characters']}")
        print(f"   Total words: {stats['total_words']}")
        print(f"   Processing time: {stats['processing_time']:.2f} seconds")

        sys.exit(0)
    else:
        logger.error(f"Processing failed: {result.get('error', 'Unknown error')}")
        sys.exit(1)


if __name__ == '__main__':
    main()