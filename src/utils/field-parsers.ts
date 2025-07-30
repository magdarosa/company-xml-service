import { Logger } from '@nestjs/common';

const logger = new Logger('FieldParsers');

/**
 * Parses an XML field into an integer value with fallback handling
 * 
 * xml2js returns arrays by default (example: ['1']), so we extract the first
 * element and parse it as an integer.
 * 
 * @param field - String or array value from XML parsing (may be undefined)
 * @returns Parsed integer value or 0 if parsing fails or field is empty
 */
export function parseIntegerField(field: string | string[] | undefined): number {
  // Handle xml2js array format
  const value = Array.isArray(field) ? field[0] : field;
  
  if (!value || value === '') {
    logger.warn('Missing or empty integer field, defaulting to 0');
    return 0;
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    logger.warn(`Invalid integer value: ${value}, defaulting to 0`);
    return 0;
  }

  return parsed;
}

/**
 * Parses an XML field into a string value with fallback handling
 * 
 * xml2js returns arrays by default (example: ['MWNZ']), so we extract the first
 * element as a string.
 * 
 * @param field - String or array value from XML parsing (may be undefined)
 * @returns String value or empty string if field is empty
 */
export function parseStringField(field: string | string[] | undefined): string {
  // Handle xml2js array format
  const value = Array.isArray(field) ? field[0] : field;
  
  if (!value) {
    logger.warn(
      'Missing or empty string field, defaulting to empty string',
    );
    return '';
  }

  return value;
}