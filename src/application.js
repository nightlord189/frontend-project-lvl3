import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import * as _ from 'lodash';
import i18next from 'i18next';
import { renderForm, renderBody } from './view.js';
import { parseRSS, markIDs } from './parser.js';
import locale from './locale.js';
import config from './config.js';

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

// app
const app = () => {
  const state = {
    body: {
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

  const watchedBody = onChange(state.body, () => {
    renderBody(state.body);
  });

  const loadFeed = (feedURL) => {
    axios.get(`https://api.allorigins.win/get?url=${feedURL}`)
      .catch((error) => {
        watchedForm.feedback = error;
        watchedForm.state = 'filling';
      })
      .then((response) => {
        if (_.isEmpty(response.data.contents)) {
          watchedForm.feedback = i18next.t('form.networkError');
          return;
        }

        const parsed = parseRSS(response.data.contents);
        const marked = markIDs(parsed, feedURL);

        watchedBody.posts = [...state.body.posts, ...marked.posts];
        watchedBody.feeds.push(marked.feed);
        watchedForm.currentURL = null;
        watchedForm.feedback = i18next.t('form.success');
      })
      .catch((error) => {
        watchedForm.feedback = `${i18next.t('form.parsingError')}: ${error}`;
      })
      .finally(() => {
        watchedForm.state = 'filling';
        console.log(state);
      });
  }

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
          if (state.body.feeds.filter((x) => x.link === feedURL).length > 0) {
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

  const getUniquePosts = (posts) => {
    return posts.filter((newPost) => {
      return state.body.posts.filter((existPost) => {
        return _.isEqual(existPost, newPost);
      }).length === 0;
    });
    //return posts;
  }

  const updatePost = (feedURL) => {
    return new Promise((resolve) => {
      axios.get(`https://api.allorigins.win/get?url=${feedURL}`)
        .catch((error) => {
          console.log(error);
          resolve([]);
        })
        .then((response) => {
          if (_.isEmpty(response.data.contents)) {
            resolve([]);
          }

          const parsed = parseRSS(response.data.contents);
          const marked = markIDs(parsed, feedURL);
          const unique = getUniquePosts(marked.posts);
          resolve(unique);
        })
        .catch((error) => {
          console.log(error);
          resolve([]);
        })
    });
  }


  const updatePosts = () => {
    console.log('update posts');
    const promises = state.body.feeds.map(feed => updatePost(feed.ID));
    Promise.all(promises).then((newPostBatches)=>{
      const newPosts = newPostBatches.flat();
      watchedBody.posts = [...state.body.posts, ...newPosts];
      setTimeout(updatePosts, config.updateInterval * 1000);
    });    
  }

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
