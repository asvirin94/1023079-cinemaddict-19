import he from 'he';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { COMMENTS_EMOTIONS} from '../consts.js';
import { createFilmPopupTemplate } from './popup-view.template.js';
import { isCtrlPlusEnterPressed } from '../utils.js';

dayjs.extend(relativeTime);

export default class PopupView extends AbstractStatefulView {
  #handleCloseClick = null;
  #handleControlButtonClick = null;
  #handleAddCommentSubmit = null;
  #handleDeleteCommentClick = null;

  static #DEFAULT_COMMENT_EMOJI = COMMENTS_EMOTIONS[0];

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

  reset(film) {
    this.updateElement(
      PopupView.parseFilmToState(film)
    );
  }

  _restoreHandlers() {
    this.element.querySelector('.film-details__close-btn').addEventListener('click', this.#closeClickHandler);
    this.element.querySelector('.film-details__controls').addEventListener('click', this.#controlButtonsClickHandler);
    this.element.querySelector('.film-details__comments-list').addEventListener('click', this.#deleteCommentClickHandler);
    this.element.querySelector('.film-details__comment-input').addEventListener('keydown', this.#addCommentKeydownHandler);
    this.element.querySelector('.film-details__emoji-list').addEventListener('change', this.#emojiChangeHandler);
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
    if (isCtrlPlusEnterPressed) {
      const commentToAdd = {
        id: Math.random().toString(),
        comment: he.encode(evt.target.value),
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
      this.element.scrollTo(0, this._state.scrollPosition);
    }
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
      scrollPosition: this.element.scrollTop
    });
    this.element.scrollTo(0, this._state.scrollPosition);
  };

  static parseFilmToState(film) {
    return {
      ...film,
      commentEmoji: PopupView.#DEFAULT_COMMENT_EMOJI,
    };
  }

  static parseStateToFilm(state) {
    const film = {
      ...state,
      comments: state.comments.map((comment) => comment.id)
    };

    delete film.scrollPosition;
    delete film.commentEmoji;

    return film;
  }
}
