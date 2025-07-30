import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { CompaniesService } from './companies.service';
import { Company } from './dto/company.dto';

/**
 * Note: These tests work with the simplified interface approach.
 * xml2js still returns arrays internally, but our casting and type
 * definitions handle this transparently.
 */
describe('CompaniesService', () => {
  let service: CompaniesService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompany', () => {
    it('should return company data when XML is successfully fetched and parsed', async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Data>
  <id>1</id>
  <name>MWNZ</name>
  <description>..is awesome</description>
</Data>`;

      const axiosResponse: AxiosResponse = {
        data: xmlResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getCompany(1);

      const expectedCompany: Company = {
        id: 1,
        name: 'MWNZ',
        description: '..is awesome',
      };

      expect(result).toEqual(expectedCompany);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/MiddlewareNewZealand/evaluation-instructions/main/xml-api/1.xml',
        {
          headers: { Accept: 'application/xml' },
          timeout: 5000,
        },
      );
    });

    it('should return company data for ID 2', async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Data>
  <id>2</id>
  <name>Other</name>
  <description>....is not</description>
</Data>`;

      const axiosResponse: AxiosResponse = {
        data: xmlResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getCompany(2);

      const expectedCompany: Company = {
        id: 2,
        name: 'Other',
        description: '....is not',
      };

      expect(result).toEqual(expectedCompany);
    });

    it('should throw NOT_FOUND when XML service returns 404', async () => {
      const axiosError = {
        response: {
          status: 404,
        },
      } as AxiosError;

      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.getCompany(99)).rejects.toThrow(
        new HttpException(
          {
            error: 'Not Found',
            error_description: 'Company with ID 99 not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw SERVICE_UNAVAILABLE when XML service returns 500', async () => {
      const axiosError = {
        response: {
          status: 500,
        },
      } as AxiosError;

      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.getCompany(1)).rejects.toThrow(
        new HttpException(
          {
            error: 'Service Unavailable',
            error_description: 'External XML service is experiencing issues',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should throw SERVICE_UNAVAILABLE when XML service is unreachable', async () => {
      const networkError = new Error('Network Error');
      mockHttpService.get.mockReturnValue(throwError(() => networkError));

      await expect(service.getCompany(1)).rejects.toThrow(
        new HttpException(
          {
            error: 'Service Unavailable',
            error_description:
              'Unable to retrieve company data from XML service',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should throw SERVICE_UNAVAILABLE when XML is malformed', async () => {
      const malformedXml = 'This is not valid XML';
      const axiosResponse: AxiosResponse = {
        data: malformedXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      await expect(service.getCompany(1)).rejects.toThrow(
        new HttpException(
          {
            error: 'Service Unavailable',
            error_description: 'Unable to process data from XML service',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should throw SERVICE_UNAVAILABLE when XML is missing Data element', async () => {
      const xmlWithoutData = `<?xml version="1.0" encoding="UTF-8"?>
<Company>
  <id>1</id>
  <name>MWNZ</name>
</Company>`;

      const axiosResponse: AxiosResponse = {
        data: xmlWithoutData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      await expect(service.getCompany(1)).rejects.toThrow(
        new HttpException(
          {
            error: 'Service Unavailable',
            error_description: 'Unable to process data from XML service',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should handle XML with missing fields gracefully', async () => {
      const xmlWithMissingFields = `<?xml version="1.0" encoding="UTF-8"?>
<Data>
  <id>1</id>
</Data>`;

      const axiosResponse: AxiosResponse = {
        data: xmlWithMissingFields,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getCompany(1);

      const expectedCompany: Company = {
        id: 1,
        name: '',
        description: '',
      };

      expect(result).toEqual(expectedCompany);
    });

    it('should handle invalid integer values gracefully', async () => {
      const xmlWithInvalidId = `<?xml version="1.0" encoding="UTF-8"?>
<Data>
  <id>invalid</id>
  <name>Test Company</name>
  <description>Test Description</description>
</Data>`;

      const axiosResponse: AxiosResponse = {
        data: xmlWithInvalidId,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getCompany(1);

      const expectedCompany: Company = {
        id: 0, // Should default to 0 for invalid integer
        name: 'Test Company',
        description: 'Test Description',
      };

      expect(result).toEqual(expectedCompany);
    });

    it('should handle empty XML fields gracefully', async () => {
      const xmlWithEmptyFields = `<?xml version="1.0" encoding="UTF-8"?>
<Data>
  <id></id>
  <name></name>
  <description></description>
</Data>`;

      const axiosResponse: AxiosResponse = {
        data: xmlWithEmptyFields,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getCompany(1);

      const expectedCompany: Company = {
        id: 0, // Empty string should default to 0
        name: '',
        description: '',
      };

      expect(result).toEqual(expectedCompany);
    });

    it('should throw SERVICE_UNAVAILABLE when XML service returns wrong content type', async () => {
      const htmlResponse = '<html><body>Not Found</body></html>';
      const axiosResponse: AxiosResponse = {
        data: htmlResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      await expect(service.getCompany(1)).rejects.toThrow(
        new HttpException(
          {
            error: 'Service Unavailable',
            error_description: 'Unable to process data from XML service',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should accept valid XML content types', async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Data>
  <id>1</id>
  <name>MWNZ</name>
  <description>..is awesome</description>
</Data>`;

      const testCases = [
        'application/xml',
        'text/xml',
        'application/xml; charset=utf-8',
        'text/xml; charset=utf-8',
        'text/plain; charset=utf-8',
      ];

      for (const contentType of testCases) {
        const axiosResponse: AxiosResponse = {
          data: xmlResponse,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': contentType },
          config: {} as any,
        };

        mockHttpService.get.mockReturnValue(of(axiosResponse));

        const result = await service.getCompany(1);
        expect(result.id).toBe(1);
        expect(result.name).toBe('MWNZ');
      }
    });

    it('should handle missing content-type header gracefully', async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Data>
  <id>1</id>
  <name>MWNZ</name>
  <description>..is awesome</description>
</Data>`;

      const axiosResponse: AxiosResponse = {
        data: xmlResponse,
        status: 200,
        statusText: 'OK',
        headers: {}, // No content-type header
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getCompany(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('MWNZ');
    });
  });
});
