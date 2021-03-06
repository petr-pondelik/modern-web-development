import { Card, CardContent, Typography } from '@mui/material';
import { Shell_EntityCardHeader } from 'features/core/entity-card';
import { Shell_EntityList } from 'features/core/entity-list';

export const Shell_ReadingListCard = () => {
  return <Card sx={{ minWidth: '100%', maxWidth: '100%' }} variant={'elevation'} elevation={0}>
    <Shell_EntityCardHeader/>
    <CardContent>
      <Typography variant={'h4'} style={{ marginBottom: '2rem' }}>
        ...
      </Typography>
      <Shell_EntityList/>
    </CardContent>
  </Card>;
}