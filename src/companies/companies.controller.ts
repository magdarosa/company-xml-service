import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { Company } from './dto/company.dto';
import { ErrorResponse } from './dto/error.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company found',
    type: Company,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable',
    type: ErrorResponse,
  })
  async getCompany(@Param('id', ParseIntPipe) id: number): Promise<Company> {
    return this.companiesService.getCompany(id);
  }
}
