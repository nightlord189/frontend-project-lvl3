import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import {renderForm, renderBody} from './view.js';
import parseRSS from './parser.js';
import * as _ from 'lodash';

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
                watchedForm.feedback = isValid ? null : 'Must be valid url';
                if (isValid) {
                    axios.get(`https://api.allorigins.win/get?url=${state.form.currentURL}`)
                        .catch((error) => {
                            watchedForm.feedback = error;
                        })
                        .then((response) => {                    
                            if (_.isEmpty(response.data.contents)) {
                                watchedForm.feedback = 'Network error';
                                return;
                            }

                            const parsed = parseRSS(response.data.contents)

                            watchedBody.posts = [...state.body.posts, ...parsed.posts];
                            watchedBody.feeds.push(parsed.feed);
                            watchedForm.currentURL  = null;
                            
                        })
                        .catch((error) => {
                            watchedForm.feedback = `Parsing error: ${error}`;
                            return;
                        });
                }
            });
    };

    const onInputChange = (e) => {
        state.form.currentURL = e.target.value;
    };

    const init = () => {
        document.querySelector('form').addEventListener('submit', onSubmit);
        document.querySelector('#rss-feed-input').addEventListener('change', onInputChange);
    };

    init();
    renderForm(watchedForm);
};

export default app;
