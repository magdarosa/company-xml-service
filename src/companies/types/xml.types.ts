/**
 * Interface for parsed XML data from xml2js
 * 
 * xml2js returns arrays for all elements by default (example: id: ['1']),
 * so we properly type this to reflect the actual structure.
 */
export interface ParsedXmlData {
    Data?: {
      id?: string[];
      name?: string[];
      description?: string[];
    };
  }