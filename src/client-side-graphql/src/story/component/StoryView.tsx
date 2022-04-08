import { CardContent, Grid, IconButton, Typography } from '@mui/material';
import { Shell_StoryCard } from './story-card';
import { EntityCard, EntityCardHeader, formatAuthor } from '../../common';
import { ReadingListsRelations, StoryUpdateDialog } from './dialogs';
import { AppUser, useJwtStore } from '../../store';
import { StoryQueryStory, UserStoryQueryStory } from '../../graphql/queries';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDeleteStoryMutation } from '../../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import { apolloClient } from '../../graphql';

const AssignToReadingLists = (user: AppUser | null, story: any) => {
  return user ? <ReadingListsRelations user={user} story={story} /> : null;
};

type StoryViewProps = {
  story: StoryQueryStory | UserStoryQueryStory | undefined;
  isLoading: boolean;
  deleteBacklink?: string;
  allowUpdate?: boolean
};

export const StoryView = (props: StoryViewProps) => {
  const { story, isLoading, deleteBacklink, allowUpdate } = props;

  if (isLoading || !story || !story.author) {
    return <Shell_StoryCard />;
  }

  const user = useJwtStore((state) => state.user);
  const navigate = useNavigate();

  const updateNode = () => {
    return allowUpdate ? <StoryUpdateDialog story={story} /> : null;
  }

  const deleteCallback = () => {
    navigate(deleteBacklink ?? '');
    apolloClient.refetchQueries({
      include: ['UserStories'],
    });
  };

  const [deleteStory] = useDeleteStoryMutation({ id: story.id }, deleteCallback);

  const deleteNode = () => {
    if (!deleteBacklink) {
      return null;
    }
    return (
      <IconButton aria-label="settings" onClick={() => deleteStory()}>
        <DeleteIcon />
      </IconButton>
    );
  };

  return (
    <EntityCard>
      <EntityCardHeader
        title={formatAuthor(story.author)}
        subheader={story.createdAt}
        author={story.author}
        updateNode={updateNode()}
        deleteNode={deleteNode()}
      />
      <CardContent>
        <Grid container style={{ marginBottom: '2rem' }}>
          <Grid item xs={12}>
            <Typography variant={'h4'} sx={{ marginBottom: '1rem' }}>
              {story.title ?? '...'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {AssignToReadingLists(user, story)}
          </Grid>
        </Grid>
        <Typography variant={'body1'} style={{ marginBottom: '2rem' }}>
          {story.description ?? '...'}
        </Typography>
        <Typography variant={'body1'}>{story.content ?? '...'}</Typography>
      </CardContent>
    </EntityCard>
  );
};

export default StoryView;
