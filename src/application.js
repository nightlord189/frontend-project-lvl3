import render from './render.js';
import * as yup from 'yup';

let schema = yup.object().shape({
    url: yup.string().url().required()
});
  

//app
const app = () => {
    const state = {
        feeds: [],
        posts: [],
        currentURL: '',
        isURLValid: true,
        feedback: null
    }

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('submit');

        schema
        .isValid({
            url: state.currentURL
        })
        .then((isValid) => {
            state.isURLValid = isValid;
            state.feedback = isValid ? null : 'Must be valid url';
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
    render(state);
}

export default app;
