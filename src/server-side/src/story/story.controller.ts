import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto, SearchStoryDto, UpdateStoryDto } from './dto';
import { addLinks, createLink } from '../common/hateoas';
import { UserPath } from '../user/user.controller';
import { User } from '../common/decorator';
import { apiPath } from '../common/helper';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationResponseHeaderInterceptor } from '../common/interceptor';
import { ErrorMessage } from '../common/message';
import { StoryCollectionEnvelope, StoryEnvelope } from './envelopes';
import { JwtAuthGuard } from '../auth/guard';

export const StoryPath = 'stories';
export const StoryVersion = '1';

@ApiTags('Stories')
@Controller({
  path: StoryPath,
  version: StoryVersion,
})
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @ApiOperation({
    summary: 'Find newest stories.',
  })
  @ApiOkResponse({
    description: 'Stories successfully retrieved.',
    type: StoryCollectionEnvelope,
  })
  @Get()
  @HttpCode(200)
  async findNewest(): Promise<StoryCollectionEnvelope> {
    const stories = await this.storyService.findMany();
    const envelope = new StoryCollectionEnvelope(stories);
    addLinks(envelope, [
      createLink('self', apiPath(StoryPath), 'GET'),
      createLink('search', apiPath(StoryPath, 'search'), 'POST'),
    ]);
    for (const a of envelope.data) {
      addLinks(a, [
        createLink('self', apiPath(StoryPath, a.id), 'GET'),
        createLink('author', apiPath(UserPath, a.authorId), 'GET'),
      ]);
    }
    return envelope;
  }

  @ApiOperation({
    summary: 'Search stories.',
  })
  @ApiOkResponse({
    description: 'Stories successfully retrieved.',
    type: StoryCollectionEnvelope,
  })
  @Post('search')
  @HttpCode(200)
  async search(@Body() dto: SearchStoryDto): Promise<StoryCollectionEnvelope> {
    const stories = await this.storyService.search(dto);
    const envelope = new StoryCollectionEnvelope(stories);
    addLinks(envelope, [createLink('self', apiPath(StoryPath, 'search'), 'POST')]);
    for (const a of envelope.data) {
      addLinks(a, [
        createLink('self', apiPath(StoryPath, a.id), 'GET'),
        createLink('author', apiPath(UserPath, a.authorId), 'GET'),
      ]);
    }
    return envelope;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find story.',
  })
  @ApiOkResponse({
    description: 'Story successfully retrieved.',
    type: StoryEnvelope,
  })
  @ApiNotFoundResponse({
    description: 'Story not found.',
    type: ErrorMessage,
  })
  async findOne(@Param('id', ParseIntPipe) _id: number): Promise<StoryEnvelope> {
    const story = await this.storyService.findUnique({ id: _id });
    let envelope = new StoryEnvelope();
    envelope = { ...envelope, ...story };
    const links = [
      createLink('self', apiPath(StoryPath, story.id), 'GET'),
      createLink('author', apiPath(UserPath, story.authorId), 'GET'),
    ];
    addLinks(envelope, links);
    return envelope;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new story.',
  })
  @ApiOkResponse({
    description: 'Story successfully created.',
    type: StoryEnvelope,
  })
  @UseInterceptors(new LocationResponseHeaderInterceptor(apiPath(StoryPath)))
  async create(@Body() dto: CreateStoryDto): Promise<StoryEnvelope> {
    const story = await this.storyService.create(dto);
    let envelope = new StoryEnvelope();
    envelope = { ...envelope, ...story };
    addLinks(envelope, [
      createLink('self', apiPath(StoryPath, story.id), 'GET'),
      createLink('author', apiPath(UserPath, story.authorId), 'GET'),
      createLink('update', apiPath(StoryPath, story.id), 'PATCH'),
      createLink('delete', apiPath(StoryPath, story.id), 'DELETE'),
    ]);
    return envelope;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Partially update story.',
  })
  @ApiOkResponse({
    description: 'Story successfully updated.',
    type: StoryEnvelope,
  })
  @ApiNotFoundResponse({
    description: 'Story not found.',
    type: ErrorMessage,
  })
  @ApiForbiddenResponse({
    description: 'Access to the story is forbidden.',
    type: ErrorMessage,
  })
  @UseInterceptors(new LocationResponseHeaderInterceptor(apiPath(StoryPath)))
  async update(
    @Param('id', ParseIntPipe) _id: number,
    @Body() dto: UpdateStoryDto,
    @User() user,
  ): Promise<StoryEnvelope> {
    /** Owner-level access restriction */
    const story = await this.storyService.findUnique({ id: _id });
    if (user.id !== story.authorId) {
      throw new ForbiddenException();
    }
    const storyNew = await this.storyService.update(_id, dto);
    let envelope = new StoryEnvelope();
    envelope = { ...storyNew, ...envelope };
    addLinks(envelope, [
      createLink('self', apiPath(StoryPath, story.id), 'GET'),
      createLink('author', apiPath(UserPath, story.authorId), 'GET'),
      createLink('update', apiPath(StoryPath, story.id), 'PATCH'),
      createLink('delete', apiPath(StoryPath, story.id), 'DELETE'),
    ]);
    return envelope;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete story.',
  })
  @ApiOkResponse({
    description: 'Story successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'Story not found.',
    type: ErrorMessage,
  })
  @ApiForbiddenResponse({
    description: 'Access to the story is forbidden.',
    type: ErrorMessage,
  })
  async delete(@Param('id', ParseIntPipe) _id: number, @User() user) {
    /** Owner-level access restriction */
    const story = await this.storyService.findUnique({ id: _id });
    if (user.id !== story.authorId) {
      throw new ForbiddenException();
    }
    await this.storyService.delete(_id);
  }
}