import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './dto/company.dto';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: CompaniesService;

  const mockCompaniesService = {
    getCompany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompany', () => {
    it('should return a company when service succeeds', async () => {
      const expectedCompany: Company = {
        id: 1,
        name: 'MWNZ',
        description: '..is awesome',
      };

      mockCompaniesService.getCompany.mockResolvedValue(expectedCompany);

      const result = await controller.getCompany(1);

      expect(result).toEqual(expectedCompany);
      expect(service.getCompany).toHaveBeenCalledWith(1);
    });

    it('should propagate service errors', async () => {
      const httpException = new HttpException(
        {
          error: 'Not Found',
          error_description: 'Company with ID 99 not found',
        },
        HttpStatus.NOT_FOUND,
      );

      mockCompaniesService.getCompany.mockRejectedValue(httpException);

      await expect(controller.getCompany(99)).rejects.toThrow(httpException);
    });
  });
});
