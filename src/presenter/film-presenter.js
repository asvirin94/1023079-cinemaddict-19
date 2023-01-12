import { remove, render } from '../framework/render.js';
import FilmCardView from '../view/film-card-view.js';
import PopupView from '../view/popup-view.js';


export default class FilmPresenter {
  #filmListContainer;
  #bodyContainer;
  #handlePopupOpen;
  #handlePopupClose;
  #film;
  #comments;
  #filmCardView;
  #popupView;

  constructor(filmListContainer, bodyContainer, onPopupOpen, onPopupClose) {
    this.#filmListContainer = filmListContainer;
    this.#bodyContainer = bodyContainer;
    this.#handlePopupOpen = onPopupOpen;
    this.#handlePopupClose = onPopupClose;
  }

  init(film, comments) {
    this.#film = film;
    this.#comments = comments;
    this.#film.commentsCount = this.#comments.filter(
      (comment) => comment.id === film.id
    ).length;

    this.#filmCardView = new FilmCardView(this.#film, this.#onCardClick, this.#onAddToWatchlistClick, this.#onAddToWatchedClick, this.#onAddToFavoriteClick);

    const commentsForPopup = this.#comments.slice(0, 5);
    this.#popupView = new PopupView(commentsForPopup, this.#film, this.#onCloseButtonClick, this.#onAddToWatchlistClick, this.#onAddToWatchedClick, this.#onAddToFavoriteClick);

    render(this.#filmCardView, this.#filmListContainer);
  }

  destroy = () => {
    remove(this.#filmCardView);
  };

  closePopup() {
    this.#popupView.element.remove();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#handlePopupClose();
  }

  #onCardClick = () => {
    if (this.#bodyContainer.contains(this.#popupView.element)) {
      return;
    }

    render(this.#popupView, this.#bodyContainer);
    this.#handlePopupOpen(this);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #onAddToWatchlistClick = () => {
    this.#film.isAdded = !this.#film.isAdded;

    this.#filmCardView.element.querySelector('.film-card__controls-item--add-to-watchlist').classList.toggle('film-card__controls-item--active');
    this.#popupView.element.querySelector('.film-details__control-button--watchlist').classList.toggle('film-details__control-button--active');
  };

  #onAddToWatchedClick = () => {
    this.#film.isAdded = !this.#film.isAdded;

    this.#filmCardView.element.querySelector('.film-card__controls-item--mark-as-watched').classList.toggle('film-card__controls-item--active');
    this.#popupView.element.querySelector('.film-details__control-button--watched').classList.toggle('film-details__control-button--active');
  };

  #onAddToFavoriteClick = () => {
    this.#film.isAdded = !this.#film.isAdded;

    this.#filmCardView.element.querySelector('.film-card__controls-item--favorite').classList.toggle('film-card__controls-item--active');
    this.#popupView.element.querySelector('.film-details__control-button--favorite').classList.toggle('film-details__control-button--active');
  };

  #onCloseButtonClick = () => {
    this.closePopup();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.closePopup();
    }
  };
}
