import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { createFilmPopupTemplate } from './popup-view.template.js';
import { isCtrlPlusEnterPressed } from '../utils.js';

dayjs.extend(relativeTime);

export default class PopupView extends AbstractStatefulView {
  #handleCloseClick = null;
  #handleControlButtonClick = null;
  #handleAddCommentSubmit = null;
  #handleDeleteCommentClick = null;

  static #DEFAULT_COMMENT_EMOJI = '';

  constructor({film, onCloseClick, onControlBtnClick, onAddComment, onDeleteComment}) {
    super();
    this._setState(PopupView.parseFilmToState(film));

    this.#handleCloseClick = onCloseClick;
    this.#handleControlButtonClick = onControlBtnClick;
    this.#handleAddCommentSubmit = onAddComment;
    this.#handleDeleteCommentClick = onDeleteComment;

    this._restoreHandlers();
  }

  get template() {
    return createFilmPopupTemplate(this._state);
  }

  _restoreHandlers() {
    const commentInputElement = this.element.querySelector('.film-details__comment-input');
    this.element.querySelector('.film-details__close-btn').addEventListener('click', this.#closeClickHandler);
    this.element.querySelector('.film-details__controls').addEventListener('click', this.#controlButtonsClickHandler);
    this.element.querySelector('.film-details__comments-list').addEventListener('click', this.#deleteCommentClickHandler);
    this.element.querySelector('.film-details__comment-input').addEventListener('keydown', this.#addCommentKeydownHandler);
    commentInputElement.addEventListener('keydown', this.#addCommentKeydownHandler);
    commentInputElement.addEventListener('input', this.#commentInputHandler);
    this.element.querySelector('.film-details__emoji-list').addEventListener('change', this.#emojiChangeHandler);
  }

  closePopup() {
    this.#resetCommentForm();
    this.element.remove();
  }

  #closeClickHandler = () => {
    this.#handleCloseClick();
  };

  #controlButtonsClickHandler = (evt) => {
    if (evt.target.classList.contains('film-details__control-button')) {
      this.updateElement({
        userDetails: {
          ...this._state.userDetails,
          [evt.target.dataset.userDetail]: !this._state.userDetails[evt.target.dataset.userDetail],
        },
        scrollPosition: this.element.scrollTop
      });
      this.#handleControlButtonClick(PopupView.parseStateToFilm(this._state));
      this.element.scrollTo(0, this._state.scrollPosition);
    }
  };

  #addCommentKeydownHandler = (evt) => {
    if (isCtrlPlusEnterPressed(evt)) {
      const commentToAdd = {
        id: Math.random().toString(),
        comment: this._state.commentText,
        emotion: this._state.commentEmoji
      };
      this.updateElement({
        comments: [...this._state.comments, commentToAdd],
        scrollPosition: this.element.scrollTop
      });
      this.#handleAddCommentSubmit({
        ...PopupView.parseStateToFilm(this._state),
        commentToAdd
      });
      this.#resetCommentForm();
      this.element.scrollTo(0, this._state.scrollPosition);
    }
  };

  #commentInputHandler = (evt) => {
    this._setState({
      commentText: evt.target.value,
    });
  };

  #deleteCommentClickHandler = (evt) => {
    if (evt.target.classList.contains('film-details__comment-delete')) {
      const commentToDelete = this._state.comments.find((comment) => comment.id === evt.target.dataset.id);
      this.updateElement({
        comments: this._state.comments.filter((comment) => comment.id !== evt.target.dataset.id),
        scrollPosition: this.element.scrollTop
      });
      this.#handleDeleteCommentClick({
        ...PopupView.parseStateToFilm(this._state),
        commentToDelete
      });
      this.element.scrollTo(0, this._state.scrollPosition);
    }
  };

  #emojiChangeHandler = (evt) => {
    this.updateElement({
      commentEmoji: evt.target.value,
      commentText: this._state.commentText,
      scrollPosition: this.element.scrollTop
    });
    this.element.scrollTo(0, this._state.scrollPosition);
  };

  #resetCommentForm() {
    this.updateElement({
      commentText: '',
      commentEmoji: PopupView.#DEFAULT_COMMENT_EMOJI,
    });
  }

  static parseFilmToState(film) {
    return {
      ...film,
      commentEmoji: PopupView.#DEFAULT_COMMENT_EMOJI
    };
  }

  static parseStateToFilm(state) {
    const film = {...state};

    delete film.scrollPosition;
    delete film.commentEmoji;
    delete film.commentText;

    return film;
  }
}
