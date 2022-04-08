import { render } from 'react-dom';
import React from 'react';
import './index.css';
import App from './app/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import UserViewPage from './user/pages/UserViewPage';
import { SignInPage } from './sign-in';
import {
  ReadingListCollectionPage,
  ReadingListViewPage as UserReadingListViewPage,
  StoryCollectionPage,
  StoryViewPage as UserStoryViewPage,
} from './user';
import { StoryListPage, StoryViewPage } from './story';

const rootElement = document.getElementById('root');
render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        <Route index element={<StoryListPage />} />
        <Route path={'/sign-in'} element={<SignInPage />} />
        <Route path={'/stories'} element={<StoryListPage />} />
        <Route path={'/stories/:id'} element={<StoryViewPage />} />
        <Route path={'/users/:id'} element={<UserViewPage />} />
        <Route path={'/users/:id/stories'} element={<StoryCollectionPage />} />
        <Route path={'/users/:userId/stories/:storyId'} element={<UserStoryViewPage />} />
        <Route path={'/users/:id/reading-lists'} element={<ReadingListCollectionPage />} />
        <Route path={'/users/:userId/reading-lists/:readingListTitle'} element={<UserReadingListViewPage />} />
        {/*  <Route path="*" element={<NotFound />} />*/}
      </Route>
    </Routes>
  </BrowserRouter>,
  rootElement,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();