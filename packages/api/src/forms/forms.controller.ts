import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import type { CreateFormDto } from './dto/create-form.dto.js';
import type { UpdateFormDto } from './dto/update-form.dto.js';
import type { StoredFormDto } from './dto/stored-form.dto.js';
import { FormsService } from './forms.service.js';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  findAll(): Promise<StoredFormDto[]> {
    return this.formsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<StoredFormDto> {
    return this.formsService.findOne(id);
  }

  @Post()
  create(@Body() createFormDto: CreateFormDto): Promise<StoredFormDto> {
    return this.formsService.create(createFormDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto
  ): Promise<StoredFormDto> {
    return this.formsService.update(id, updateFormDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.formsService.remove(id);
  }
}

