import {render, renderForm} from './render.js';
import * as yup from 'yup';
import onChange from 'on-change';

let schema = yup.object().shape({
    url: yup.string().url().required()
});
  

//app
const app = () => {
    const state = {
        feeds: [],
        posts: [],

        form: {
            currentURL: '',
            isURLValid: true,
            feedback: null
        }
    }

    const watchedForm = onChange(state.form, (path, value, previousValue) => {
        renderForm(state.form);
    });
    

    const onSubmit = (e) => {
        e.preventDefault();

        schema
        .isValid({
            url: state.currentURL
        })
        .then((isValid) => {
            watchedForm.isURLValid = isValid;
            watchedForm.feedback = isValid ? null : 'Must be valid url';
        });
    }

    const onInputChange = (e) => {
        state.currentURL = e.target.value;
        console.log(state);
    }

    const init = () => {
        document.querySelector('form').addEventListener('submit', onSubmit);
        document.querySelector('#rss-feed-input').addEventListener('change', onInputChange);   
    }

    init();
    renderForm (watchedForm);
}

export default app;
