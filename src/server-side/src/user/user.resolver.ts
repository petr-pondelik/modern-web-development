import { UserService } from './user.service';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReadingListService } from '../reading-list/reading-list.service';
import { GqlJwtAuthGuard } from '../auth/guard';
import { GraphQLUser } from '../common/decorator';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService, private readingListService: ReadingListService) {
  }

  @Query('user')
  async getUser(@Args('id', ParseIntPipe) id: number) {
    return this.userService.findOneById(id);
  }

  @ResolveField('stories')
  async getStories(@Parent() user, @Args('limit') limit: number) {
    const { id } = user;
    return this.userService.findStories(id, limit);
  }

  @ResolveField('story')
  async getStory(@Parent() user, @Args('id') storyId: number) {
    const { id: userId } = user;
    return this.userService.findStory(userId, storyId);
  }

  @UseGuards(GqlJwtAuthGuard)
  @ResolveField('readingLists')
  async getReadingLists(@GraphQLUser() authUser, @Parent() user, @Args('limit') limit: number) {
    console.log(authUser);
    const { id } = user;
    return this.userService.findReadingLists(id, limit);
  }

  @ResolveField('readingList')
  async getReadingList(@Parent() user, @Args('title') title: string) {
    const { id: userId } = user;
    return this.readingListService.findUnique({ authorId: userId, title: title });
  }
}