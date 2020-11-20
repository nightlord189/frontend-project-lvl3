import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import * as _ from 'lodash';
import i18next from 'i18next';
import { renderForm, renderFeeds, renderPosts } from './view.js';
import parseRSS from './parser.js';
import locale from './locale.js';
import config from './config.js';

// app
const app = () => {
  const state = {
    feeds: [],
    posts: [],
    status: 'filling',
    currentURL: '',
    errors: [],
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'feeds') {
      renderFeeds(state);
    } else if (path === 'posts') {
      renderPosts(state);
    } else {
      renderForm(state);
    }
  });

  const markIDs = (parsedRss, feedID) => ({
    feed: {
      title: parsedRss.feed.title,
      description: parsedRss.feed.description,
      ID: feedID,
    },
    items: parsedRss.items.map((x) => ({
      title: x.title,
      link: x.link,
      feedID,
    })),
  });

  const loadFeed = (feedURL) => {
    axios.get(`${config.proxy}${feedURL}`)
      .then((response) => {
        const parsed = parseRSS(response);
        const marked = markIDs(parsed, feedURL);

        watchedState.posts = [...state.posts, ...marked.items];
        watchedState.feeds.push(marked.feed);
        watchedState.currentURL = null;
        watchedState.errors = [];
      })
      .catch((error) => {
        watchedState.errors.push(error);
      })
      .finally(() => {
        watchedState.status = 'filling';
      });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (state.status !== 'filling') {
      return;
    }
    watchedState.status = 'checking';
    watchedState.errors = [];

    const validationSchema = yup.object().shape({
      url: yup.string().url().notOneOf(state.feeds.map((x) => x.ID)).required(),
    });

    try {
      validationSchema.validateSync({
        url: state.currentURL,
      });
      loadFeed(state.currentURL);
    } catch (error) {
      console.log(error);
      watchedState.status = 'filling';
      watchedState.errors.push(error.type);
    }
  };

  const onInputChange = (e) => {
    state.currentURL = e.target.value;
  };

  const updateFeed = (feedURL) => axios.get(`${config.proxy}${feedURL}`)
    .then((response) => {
      if (_.isEmpty(response.data)) {
        return [];
      }
      const parsed = parseRSS(response.data);
      const marked = markIDs(parsed, feedURL);
      return _.differenceWith(marked.items, state.posts, _.isEqual);
    })
    .catch(() => []);

  const updatePosts = () => {
    const promises = state.feeds.map((feed) => updateFeed(feed.ID));
    Promise.all(promises).then((newPostBatches) => {
      const newPosts = newPostBatches.flat();
      watchedState.posts = [...state.posts, ...newPosts];
      setTimeout(updatePosts, config.updateInterval * 1000);
    });
  };

  const init = () => {
    i18next.init({
      lng: 'en',
      debug: true,
      resources: locale,
    }, () => {
      document.querySelector('form').addEventListener('submit', onSubmit);
      document.querySelector('#rss-feed-input').addEventListener('change', onInputChange);
    });
  };

  init();
  setTimeout(updatePosts, config.updateInterval * 1000);
};

export default app;
