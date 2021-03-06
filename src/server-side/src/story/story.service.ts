import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto, SearchStoryDto, UpdateStoryDto } from './dto';
import { searchConditionHelper } from './helper';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Constants } from '../prisma/constants';
import { StoryEntity } from './entities';

@Injectable()
export class StoryService {
  constructor(private prisma: PrismaService) {}

  async findMany(_limit?: number): Promise<StoryEntity[]> {
    return this.prisma.story.findMany({
      take: _limit,
      orderBy: { id: 'desc' },
      include: {
        author: {
          select: {
            givenName: true,
            familyName: true,
          },
        },
      },
    });
  }

  async findOneById(_id: number): Promise<StoryEntity> {
    const story = await this.prisma.story.findUnique({
      where: { id: _id },
      include: {
        author: {
          select: {
            givenName: true,
            familyName: true,
          },
        },
      },
    });
    if (story === null) {
      throw new NotFoundException();
    }
    return story;
  }

  async findManyByAuthor(_authorId: number, _limit?: number): Promise<StoryEntity[]> {
    const data = await this.prisma.story.findMany({
      where: { authorId: _authorId },
      take: _limit,
      orderBy: {
        id: 'desc',
      },
    });
    if (data === null) {
      throw new NotFoundException();
    }
    return data;
  }

  async findOneByAuthor(_id: number, _authorId: number): Promise<StoryEntity> {
    const story = await this.prisma.story.findFirst({
      where: { id: _id, authorId: _authorId },
      include: {
        author: {
          select: {
            givenName: true,
            familyName: true,
          },
        },
      },
    });
    if (story === null) {
      throw new NotFoundException();
    }
    return story;
  }

  async search(dto: SearchStoryDto, _limit?: number): Promise<StoryEntity[]> {
    const _where = searchConditionHelper(dto);
    return this.prisma.story.findMany({
      where: _where,
      orderBy: { id: 'desc' },
      take: _limit,
      include: {
        author: {
          select: {
            givenName: true,
            familyName: true,
          },
        },
      },
    });
  }

  async create(dto: CreateStoryDto): Promise<StoryEntity> {
    return this.prisma.story.create({
      data: dto,
    });
  }

  async update(_id: number, dto: UpdateStoryDto): Promise<StoryEntity> {
    try {
      return await this.prisma.story.update({
        where: {
          id: _id,
        },
        data: dto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === Constants.RECORD_NOT_FOUND) {
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async delete(_id: number): Promise<StoryEntity> {
    try {
      await this.prisma.storiesOnReadingLists.deleteMany({
        where: { storyId: _id },
      });
      return await this.prisma.story.delete({
        where: {
          id: _id,
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === Constants.RECORD_NOT_FOUND) {
        throw new NotFoundException();
      }
      throw error;
    }
  }
}
