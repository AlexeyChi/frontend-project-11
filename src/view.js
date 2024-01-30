import onChange from 'on-change';

const handleProcess = (elements, state) => {
  if (state.form.formStatus !== 'error') {
    elements.inputEl.classList.remove('is-invalid');
    elements.inputEl.focus();
    elements.form.reset();
  } else {
    elements.inputEl.classList.add('is-invalid');
  }
};

const renderFeedback = (elements, state, i18nInstance) => {
  const { feedbackEl } = elements;
  feedbackEl.innerHTML = '';

  switch (state.form.errors) {
    case null: {
      feedbackEl.textContent = i18nInstance.t('errors.null');
      feedbackEl.classList.add('text-success');
      feedbackEl.classList.remove('text-danger');
      break;
    }
    case 'not uniq URL': {
      feedbackEl.textContent = i18nInstance.t('errors.notUniqURL');
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.add('text-danger');
      break;
    }
    case 'invalid URL': {
      feedbackEl.textContent = i18nInstance.t('errors.invalidURL');
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.add('text-danger');
      break;
    }
    case 'notContainValidRss': {
      feedbackEl.textContent = i18nInstance.t('errors.notContainValidRss');
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.add('text-danger');
      break;
    }
    case 'Network error': {
      feedbackEl.textContent = i18nInstance.t('errors.networkError');
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.add('text-danger');
      break;
    }
    default:
      break;
  }
};

const handleFeedsList = (state) => {
  const feedsUl = document.createElement('ul');
  feedsUl.classList.add('list-group', 'border-0', 'rounded-0');

  const feedsList = state.feeds.map(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const liTitle = document.createElement('h3');
    liTitle.classList.add('h6', 'm-0');
    liTitle.textContent = title;

    const liDescription = document.createElement('p');
    liDescription.classList.add('m-0', 'small', 'text-black-50');
    liDescription.textContent = description;

    li.append(liTitle, liDescription);
    return li;
  });

  feedsUl.replaceChildren(...feedsList);
  return feedsUl;
};

const renderFeedsContainer = (elements, state, i18nInstance) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';

  const feedsWrapper = document.createElement('div');
  feedsWrapper.classList.add('card', 'border-0');

  const feedsHeaderContainer = document.createElement('div');
  feedsHeaderContainer.classList.add('card-body');

  const feedsHeader = document.createElement('h2');
  feedsHeader.classList.add('card-title', 'h4');
  feedsHeader.textContent = i18nInstance.t('feeds');
  feedsHeaderContainer.append(feedsHeader);

  const feedsContainerBody = handleFeedsList(state);

  feedsWrapper.append(feedsHeaderContainer, feedsContainerBody);
  feedsContainer.append(feedsWrapper);
};

const handlePostsList = (state, i18nInstance) => {
  const postsUl = document.createElement('ul');
  postsUl.classList.add('list-group', 'border-0', 'rounded-0');

  const postsList = state.posts.map(({ id, title, link }) => {
    const postLi = document.createElement('li');
    postLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const postLink = document.createElement('a');
    postLink.classList.add('fw-bold');
    postLink.setAttribute('href', link);
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.dataset.id = id;
    postLink.textContent = title;

    const postBtn = document.createElement('button');
    postBtn.setAttribute('type', 'button');
    postBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postBtn.dataset.id = id;
    postBtn.dataset.bsToggle = 'modal';
    postBtn.dataset.bsTarget = '#modal';
    postBtn.textContent = i18nInstance.t('buttonContext');

    postLi.append(postLink, postBtn);
    return postLi;
  });
  postsUl.replaceChildren(...postsList);
  return postsUl;
};

const renderPostsContainer = (elements, state, i18nInstance) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';

  const postsWrapper = document.createElement('div');
  postsWrapper.classList.add('card', 'border-0');

  const postsHeaderContainer = document.createElement('div');
  postsHeaderContainer.classList.add('card-body');

  const postsHeader = document.createElement('h2');
  postsHeader.classList.add('card-title', 'h4');
  postsHeader.textContent = i18nInstance.t('posts');
  postsHeaderContainer.append(postsHeader);

  const postsContainerBody = handlePostsList(state, i18nInstance);

  postsWrapper.append(postsHeaderContainer, postsContainerBody);
  postsContainer.append(postsWrapper);
};

export default (elements, state, i18nInstance) => {
  const mainWatcher = onChange(state, (path, value) => {
    switch (path) {
      case 'feeds': {
        renderFeedsContainer(elements, state, i18nInstance);
        break;
      }
      case 'posts': {
        renderPostsContainer(elements, state, i18nInstance);
        break;
      }
      case 'form.formStatus': {
        handleProcess(elements, state); // в зависимости от состояния менять цвет рамки инпута
        break;
      }
      case 'form.errors': {
        renderFeedback(elements, state, i18nInstance); // рендер ошибки в контекст elements.feedback
        break;
      }
      default:
        break;
    }
  });
  return mainWatcher;
};
