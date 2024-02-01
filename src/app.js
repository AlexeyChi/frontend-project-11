import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import urlParser from './parsers/parser.js';

let uniqId = 1;
const validate = (url, feeds) => {
  const urlShema = yup
    .string()
    .url('invalid URL')
    .notOneOf(feeds, 'not uniq URL');
  return urlShema.validate(url, { abortEarly: false });
};

const routes = {
  fetchUrl: (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`,
};

const makeParsedResponse = (data) => {
  const fetchResponse = axios.get(routes.fetchUrl(data))
    .then((response) => urlParser(response.data.contents))
    .catch((e) => {
      if (e.message === 'Network error') {
        throw new Error('networkError');
      }
      throw e;
    });
  return fetchResponse;
};

const makeNewFeed = (data, url) => {
  const { feed } = data;
  const updatedFeed = { id: uniqId, link: url, ...feed };
  uniqId += 1;
  return updatedFeed;
};

const makeNewPosts = (feed, data) => {
  const { posts } = data;
  return [...posts].map((post) => {
    const updatedPost = { id: uniqId, feedId: feed.id, ...post };
    uniqId += 1;
    return updatedPost;
  });
};

const addNewPosts = (watchedState) => {
  const hendleNewPosts = () => {
    const usedUrls = watchedState.feeds.map(({ link }) => link);
    setTimeout(() => {
      Promise.allSettled(usedUrls.map((url) => makeParsedResponse(url)))
        .then((results) => results.forEach((promise, index) => {
          const { posts } = promise.value;
          const feed = watchedState.feeds[index];

          const oldPosts = watchedState.posts.map(({ title }) => title);
          const addedPosts = posts
            .filter(({ title }) => !oldPosts.includes(title))
            .map((post) => {
              const addedPost = { id: uniqId, feedId: feed.id, ...post };
              uniqId += 1;
              return addedPost;
            });
          watchedState.posts.unshift(...addedPosts);
        }))
        .then(() => hendleNewPosts());
    }, 5000);
  };
  hendleNewPosts();
};

export default () => {
  const defaultLenguage = 'ru';

  yup.setLocale({
    string: {
      url: 'errors.invalidURL',
    },
    mixed: {
      notOneOf: 'errors.notUniqURL',
    },
  });

  const elements = {
    form: document.querySelector('form'),
    inputEl: document.querySelector('#url-input'),
    feedbackEl: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type=submit]'),
    feedsContainer: document.querySelector('div.feeds'),
    postsContainer: document.querySelector('div.posts'),
    modal: document.querySelector('.modal'),
  };

  const state = {
    form: {
      formStatus: 'filling',
      errors: '',
    },
    uiState: {
      touchedLinkId: '',
      readLinks: new Set(),
    },
    feeds: [],
    posts: [],
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLenguage,
    debug: false,
    resources,
  }).then(() => {
    const watchedState = render(elements, state, i18nInstance);
    addNewPosts(watchedState);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newData = new FormData(e.target);
      const url = newData.get('url');
      const uniqFeeds = state.feeds.map(({ link }) => link);

      validate(url, uniqFeeds)
        .then((validUrl) => {
          watchedState.form.formStatus = 'sent';
          return makeParsedResponse(validUrl);
        })
        .then((data) => {
          watchedState.form.errors = null;
          const newFeed = makeNewFeed(data, url);
          const newPosts = makeNewPosts(newFeed, data);
          watchedState.feeds.push(newFeed);
          watchedState.posts.push(...newPosts);
        })
        .catch((err) => {
          watchedState.form.formStatus = 'error';
          watchedState.form.errors = err.message;
        });
    });

    elements.modal.addEventListener('shown.bs.modal', (e) => {
      const targetPost = e.relatedTarget.dataset;
      watchedState.uiState.touchedLinkId = +targetPost.id;
      watchedState.uiState.readLinks.add(+targetPost.id);
    });
  })
    .catch((err) => console.log('something went wrong loading', err));
};
