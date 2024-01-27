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
  const { feedback } = elements;
  feedback.innerHTML = '';

  switch (state.form.errors) {
    case null: {
      feedback.textContent = i18nInstance.t('errors.null');
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
      break;
    }
    case 'not uniq URL': {
      feedback.textContent = i18nInstance.t('errors.notUniqURL');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    }
    case 'invalid URL': {
      feedback.textContent = i18nInstance.t('errors.invalidURL');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    }
    default:
      break;
  }
};

export default (elements, state, i18nInstance) => {
  const mainWatcher = onChange(state, (path, value) => {
    switch (path) {
      case 'feeds': {
        state.form.feeds.push(value);
        // <-- проверить на дубли и если нет, добавить in state.feeds. отрендерить контейнер фидов
        break;
      }
      case 'form.formStatus': {
        handleProcess(elements, state); // в зависимости от состояния менять цвет рамки инпута
        break;
      }
      case 'form.errors': {
        renderFeedback(elements, state, i18nInstance); // рендер ошибки в контекст feedback
        break;
      }
      default:
        break;
    }
  });
  return mainWatcher;
};
