import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import * as _ from 'lodash';
import i18next from 'i18next';
import { renderForm, renderBody } from './view.js';
import parseRSS from './parser.js';
import locale from './locale.js';

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

  const onSubmit = (e) => {
    e.preventDefault();

    schema
      .isValid({
        url: state.form.currentURL,
      })
      .then((isValid) => {
        watchedForm.isURLValid = isValid;
        watchedForm.feedback = isValid ? null : i18next.t('form.invalidUrl');
        if (isValid) {
          const feedURL = state.form.currentURL;
          axios.get(`https://api.allorigins.win/get?url=${feedURL}`)
            .catch((error) => {
              watchedForm.feedback = error;
            })
            .then((response) => {
              if (_.isEmpty(response.data.contents)) {
                watchedForm.feedback = i18next.t('form.networkError');
                return;
              }

              const parsed = parseRSS(response.data.contents);
              const marked = parsed;
              marked.posts = marked.posts.map((x) => ({
                title: x.title,
                link: x.link,
                feed: feedURL,
              }));

              watchedBody.posts = [...state.body.posts, ...parsed.posts];
              watchedBody.feeds.push(parsed.feed);
              watchedForm.currentURL = null;
              watchedForm.feedback = i18next.t('form.success');
            })
            .catch((error) => {
              watchedForm.feedback = `${i18next.t('form.parsingError')}: ${error}`;
            });
        }
      });
  };

  const onInputChange = (e) => {
    state.form.currentURL = e.target.value;
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
};

export default app;
