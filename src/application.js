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
    currentURL: '',
    formStatus: 'filling',
    formErrors: [],
    loadingStatus: 'idle',
    loadingErrors: [],
  };

  const elements = {
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('#rss-feed-input'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    button: document.querySelector('.btn-primary'),
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'feeds') {
      renderFeeds(state, elements);
    } else if (path === 'posts') {
      renderPosts(state, elements);
    } else {
      renderForm(state, elements);
    }
  });

  const setId = (parsedRss, feedId) => ({
    feed: {
      title: parsedRss.feed.title,
      description: parsedRss.feed.description,
      id: feedId,
    },
    items: parsedRss.items.map((x) => ({
      title: x.title,
      link: x.link,
      feedId,
    })),
  });

  const loadFeed = (feedURL) => {
    watchedState.loadingStatus = 'loading';
    watchedState.loadingErrors = [];
    axios.get(`${config.proxy}${feedURL}`)
      .then((response) => {
        const parsed = parseRSS(response.data);
        const marked = setId(parsed, feedURL);

        watchedState.posts = [...state.posts, ...marked.items];
        watchedState.feeds.push(marked.feed);
        watchedState.currentURL = null;
      })
      .catch((error) => {
        watchedState.loadingErrors.push(error);
      })
      .finally(() => {
        watchedState.loadingStatus = 'idle';
        watchedState.formStatus = 'filling';
      });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (state.formStatus !== 'filling') {
      return;
    }
    watchedState.formStatus = 'checking';
    watchedState.formErrors = [];

    const validationSchema = yup.object().shape({
      url: yup.string().url().notOneOf(state.feeds.map((x) => x.id)).required(),
    });
    try {
      validationSchema.validateSync({
        url: state.currentURL,
      });
      watchedState.formStatus = 'waiting';
      loadFeed(state.currentURL);
    } catch (error) {
      console.log(error);
      watchedState.formStatus = 'filling';
      watchedState.formErrors.push(error.type);
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
      const marked = setId(parsed, feedURL);
      return _.differenceWith(marked.items, state.posts, _.isEqual);
    })
    .catch((error) => {
      console.log(error);
      return [];
    });

  const updatePosts = () => {
    const promises = state.feeds.map((feed) => updateFeed(feed.id));
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
