import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import * as _ from 'lodash';
import i18next from 'i18next';
import { renderForm, renderContent } from './view.js';
import parseRSS from './parser.js';
import locale from './locale.js';
import config from './config.js';

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

// app
const app = () => {
  const state = {
    content: {
      feeds: [],
      posts: [],
    },
    form: {
      state: 'filling',
      currentURL: '',
      isURLValid: true,
      feedback: null,
    },
  };

  const watchedForm = onChange(state.form, () => {
    renderForm(state.form);
  });

  const watchedContent = onChange(state.content, () => {
    renderContent(state.content);
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
      .catch((error) => {
        watchedForm.feedback = error;
        watchedForm.state = 'filling';
      })
      .then((response) => {
        if (_.isEmpty(response.data)) {
          watchedForm.feedback = i18next.t('form.networkError');
          return;
        }

        const parsed = parseRSS(response.data);
        const marked = markIDs(parsed, feedURL);

        watchedContent.posts = [...state.content.posts, ...marked.items];
        watchedContent.feeds.push(marked.feed);
        watchedForm.currentURL = null;
        watchedForm.feedback = i18next.t('form.success');
      })
      .catch((error) => {
        watchedForm.feedback = `${i18next.t('form.parsingError')}: ${error}`;
      })
      .finally(() => {
        watchedForm.state = 'filling';
      });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (state.form.state !== 'filling') {
      return;
    }
    watchedForm.state = 'checking';
    schema
      .isValid({
        url: state.form.currentURL,
      })
      .then((isValid) => {
        watchedForm.isURLValid = isValid;
        watchedForm.feedback = isValid ? null : i18next.t('form.invalidUrl');
        if (isValid) {
          const feedURL = state.form.currentURL;
          if (state.content.feeds.filter((x) => x.link === feedURL).length > 0) {
            watchedForm.state = 'filling';
            watchedForm.feedback = i18next.t('form.alreadyExists');
            return;
          }
          watchedForm.state = 'loading';
          loadFeed(state.form.currentURL);
        } else {
          watchedForm.state = 'filling';
        }
      });
  };

  const onInputChange = (e) => {
    state.form.currentURL = e.target.value;
  };

  const updateFeed = (feedURL) => new Promise((resolve) => {
    axios.get(`${config.proxy}${feedURL}`)
      .catch((error) => {
        console.log(error);
        resolve([]);
      })
      .then((response) => {
        if (_.isEmpty(response.data)) {
          resolve([]);
        }

        const parsed = parseRSS(response.data);
        const marked = markIDs(parsed, feedURL);
        const unique = _.differenceWith(marked.items, state.content.posts, _.isEqual);
        resolve(unique);
      })
      .catch((error) => {
        console.log(error);
        resolve([]);
      });
  });

  const updatePosts = () => {
    const promises = state.content.feeds.map((feed) => updateFeed(feed.ID));
    Promise.all(promises).then((newPostBatches) => {
      const newPosts = newPostBatches.flat();
      watchedContent.posts = [...state.content.posts, ...newPosts];
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
  renderForm(watchedForm);
  setTimeout(updatePosts, config.updateInterval * 1000);
};

export default app;
