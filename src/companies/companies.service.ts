import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { parseStringPromise } from 'xml2js';
import { firstValueFrom } from 'rxjs';
import { Company } from './dto/company.dto';
import { parseIntegerField, parseStringField } from '../utils/field-parsers';
import { handleServiceError } from '../utils/error-handler';
import { ParsedXmlData } from './types/xml.types';

const XML_REQUEST_TIMEOUT_MS = 5000;
const XML_API_BASE_URL = process.env.XML_API_BASE_URL || 'https://raw.githubusercontent.com/MiddlewareNewZealand/evaluation-instructions/main/xml-api';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Retrieves company information by ID from external XML service
   * 
   * @param id - The unique identifier of the company to fetch
   * @returns Company object with id, name and description
   * @throws HttpException with appropriate status code
   */
  async getCompany(id: number): Promise<Company> {
    this.logger.log(`Fetching company with ID: ${id}`);

    try {
      const xmlData = await this.fetchXmlData(id);
      const parsedData = await this.parseXmlData(xmlData);
      const validatedData = this.validateXmlStructure(parsedData, id);
      const company = this.transformToCompany(validatedData.Data);

      this.logger.log(`Successfully retrieved company: ${company.name}`);
      return company;
    } catch (error) {
      this.logger.error(`Failed to get company ${id}:`, error.message);
      throw handleServiceError(error, id);
    }
  }

  /**
   * Fetches raw XML data from the external service for a specific company ID
   * 
   * @param id - Company ID to fetch XML data for
   * @returns Promise resolving to raw XML string
   * @throws Error if HTTP request fails or content-type is not XML
   */
  private async fetchXmlData(id: number): Promise<string> {
    const xmlUrl = `${XML_API_BASE_URL}/${id}.xml`;

    this.logger.debug(`Fetching XML from: ${xmlUrl}`);

    const response = await firstValueFrom(
      this.httpService.get(xmlUrl, {
        headers: { Accept: 'application/xml' },
        timeout: XML_REQUEST_TIMEOUT_MS,
      }),
    );

    // Validate content type to ensure we received XML or plain text
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('xml') && !contentType.includes('text/plain')) {
      this.logger.warn(`Unexpected content type: ${contentType} for company ${id}`);
      throw new Error(`Expected XML content but received: ${contentType}`);
    }

    return response.data;
  }

  /**
   * Parses raw XML string into a structured JavaScript object
   * 
   * @param xmlData - Raw XML string from external service
   * @returns Parsed XML data structure
   * @throws Error if XML is malformed or cannot be parsed
   */
  private async parseXmlData(xmlData: string): Promise<ParsedXmlData> {
    try {
      this.logger.debug('Parsing XML data');
      return (await parseStringPromise(xmlData)) as ParsedXmlData;
    } catch (error) {
      this.logger.error('XML parsing failed:', error.message);
      throw new Error('Invalid XML format received from service');
    }
  }

  /**
   * Validates that parsed XML contains the required Data element
   * 
   * @param parsedData - Parsed XML object that may or may not contain Data
   * @param id - Company ID for error context
   * @returns Validated data with guaranteed Data property
   * @throws Error if required Data element is missing
   */
  private validateXmlStructure(
    parsedData: ParsedXmlData,
    id: number,
  ): Required<ParsedXmlData> {
    if (!parsedData?.Data) {
      throw new Error(`XML response missing required Data element for company id ${id}`);
    }

    return parsedData as Required<ParsedXmlData>;
  }

  /**
   * Transforms validated XML data into a Company json object
   * 
   * @param data - Validated XML data containing company information
   * @returns Company object with properly typed and parsed fields
   */
  private transformToCompany(
    data: NonNullable<ParsedXmlData['Data']>,
  ): Company {
    return {
      id: parseIntegerField(data.id),
      name: parseStringField(data.name),
      description: parseStringField(data.description),
    };
  }
}
