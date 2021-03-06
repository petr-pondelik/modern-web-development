import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateReadingListContent } from '../../graphql';

export class CreateReadingListDto extends CreateReadingListContent {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: Number
  })
  @IsNumber()
  @IsNotEmpty()
  authorId: number;
}
