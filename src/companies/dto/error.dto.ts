import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    description: 'Error type',
    example: 'Not Found',
  })
  error: string;

  @ApiProperty({
    description: 'Error description',
    example: 'Company with ID 99 not found',
  })
  error_description: string;
}
