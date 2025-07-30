import { ApiProperty } from '@nestjs/swagger';

export class Company {
  @ApiProperty({
    description: 'Company ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Company name',
    example: 'MWNZ',
  })
  name: string;

  @ApiProperty({
    description: 'Company description',
    example: '..is awesome',
  })
  description: string;
}
