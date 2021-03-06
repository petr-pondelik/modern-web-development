import { useQuery } from 'react-query';
import { StoryEnvelope } from '../envelope';
import { HttpRequest } from 'helpers';

export const useUserStory = (userId: number, storyId: number) => {
  return useQuery<StoryEnvelope>(['story', storyId], () =>
    HttpRequest<StoryEnvelope>(`/users/${userId}/stories/${storyId}`),
  );
};
