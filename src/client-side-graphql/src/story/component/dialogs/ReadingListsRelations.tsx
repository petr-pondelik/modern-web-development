import { useState } from 'react';
import { Button, Dialog, DialogTitle, List, ListItem, ListItemText, Radio } from '@mui/material';
import { AppUser } from '../../../store';
import {
  StoryQueryStory,
  UserReadingListsWithStoriesQueryReadingList,
  UserStoryQueryStory,
  useUserReadingListsWithStoriesQuery,
} from '../../../graphql/queries';
import { useAddStoryIntoReadingListMutation, useRemoveStoryFromReadingListMutation } from '../../../graphql/mutations';
import { apolloClient } from '../../../graphql';

type ReadingListItemProps = {
  readingList: UserReadingListsWithStoriesQueryReadingList;
  story: StoryQueryStory | UserStoryQueryStory;
};

const ReadingListItem = (props: ReadingListItemProps) => {
  const { readingList, story } = props;
  const stories = readingList.stories;
  const containsStory = !!stories.find((item) => item.id === story.id);

  const actionCallback = () => {
    apolloClient.refetchQueries({
      include: ['UserReadingListsWithStories'],
    });
  };

  const [addStory] = useAddStoryIntoReadingListMutation(
    {
      userId: readingList.author.id,
      title: readingList.title,
      storyId: story.id,
    },
    actionCallback,
  );

  const [removeStory] = useRemoveStoryFromReadingListMutation(
    {
      userId: readingList.author.id,
      title: readingList.title,
      id: story.id,
    },
    actionCallback,
  );

  const handleListItemClick = () => {
    if (containsStory) {
      removeStory();
    } else {
      addStory();
    }
  };

  return (
    <ListItem button onClick={handleListItemClick} key={readingList.id}>
      <ListItemText primary={readingList.title} />
      <Radio checked={containsStory} />
    </ListItem>
  );
};

export type RelationsDialogProps = {
  open: boolean;
  onClose: () => void;
  appUser: AppUser;
  story: any;
};

function RelationsDialog(props: RelationsDialogProps) {
  const { onClose, open, appUser, story } = props;

  const handleClose = () => {
    onClose();
  };

  const { data } = useUserReadingListsWithStoriesQuery({ id: appUser.sub });
  const readingLists = data?.user.readingLists ?? [];

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Reading Lists</DialogTitle>
      <List sx={{ pt: 0 }}>
        {readingLists.map((readingList) => (
          <ReadingListItem readingList={readingList} story={story} key={readingList.id} />
        ))}
      </List>
    </Dialog>
  );
}

type ReadingListsRelationsProps = {
  user: AppUser;
  story: StoryQueryStory | UserStoryQueryStory;
};

export const ReadingListsRelations = (props: ReadingListsRelationsProps) => {
  const { user, story } = props;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Assign to Reading Lists
      </Button>
      <RelationsDialog open={open} onClose={handleClose} appUser={user} story={story} />
    </div>
  );
};