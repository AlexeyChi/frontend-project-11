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

const renderFeedback = (elements, state) => {
    elements.feedback.innerHTML = '';

    switch (state.form.errors) {
        case null: {
            elements.feedback.innerHTML = 'RSS успешно загружен';
            elements.feedback.classList.add('text-success');
            elements.feedback.classList.remove('text-danger');
            break;
        }
        case 'not uniq URL': {
            elements.feedback.innerHTML = 'RSS уже существует';
            elements.feedback.classList.remove('text-success');
            elements.feedback.classList.add('text-danger');
            break;
        }
        case 'invalid URL': {
            elements.feedback.innerHTML = 'Ссылка должна быть валидным URL';
            elements.feedback.classList.remove('text-success');
            elements.feedback.classList.add('text-danger');
            break;
        }
        default: 
            break;
    }
};

export default (elements, state) => {
    const mainWatcher = onChange(state, (path, value) => {
        switch (path) {
            case 'feeds': {
                state.form.feeds.push(value); //проверить на дубли и если нет, добавить in state.feeds. отрендерить контейнер фидов
                break;
            }
            case 'form.formStatus': {
                handleProcess(elements, state); // в зависимости от состояния менять цвет рамки инпута
                break;
            }
            case 'form.errors': {
                renderFeedback(elements, state); // рендер ошибки в контекст feedback
                break;
            }
        }
    });
    return mainWatcher;
};