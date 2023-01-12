import { SortType } from '../types.js';
import { render, remove } from '../framework/render.js';
import FilterView from '../view/sort-and-filter-view.js';
import FilmContainerView from '../view/films-container-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import UserProfileView from '../view/user-profile-view.js';
import LoadingPageView from '../view/loading-page-view';
import FilmPresenter from './film-presenter.js';

const FILMS_COUNT_PER_STEP = 5;

export default class MainPresenter {
  #mainContainer;
  #headerContainer;
  #bodyContainer;
  #filmsModel;
  #commentModel;
  #filterComponent;
  #films;
  #showMoreButton;
  #filmContainerView = new FilmContainerView();
  #filmListContainer = this.#filmContainerView.filmListContainer;
  #filmPresenters = [];

  #currentSortType = SortType.DEFAULT;
  #renderedFilmsCount = 0;

  constructor(
    mainContainer,
    headerContainer,
    bodyContainer,
    filmsModel,
    commentsModel
  ) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
    this.#bodyContainer = bodyContainer;
    this.#filmsModel = filmsModel;
    this.#commentModel = commentsModel;
  }

  init() {
    this.#films = [...this.#filmsModel.films];

    this.#renderFilter();
    this.#renderFilmContainer();

    if (!this.#films.length) {
      this.#renderLoading();
    } else {
      this.#renderUserProfile();
      this.#renderCards(this.#renderedFilmsCount, this.#renderedFilmsCount + FILMS_COUNT_PER_STEP);

      if (this.#renderedFilmsCount < this.#films.length) {
        this.#renderShowMoreButton();
      }
    }
  }

  #renderFilmContainer = () => {
    render(this.#filmContainerView, this.#mainContainer);
  };

  #renderLoading = () => {
    render(new LoadingPageView(), this.#filmListContainer);
  };

  #renderUserProfile = () => {
    render(new UserProfileView(), this.#headerContainer);
  };

  #renderFilter = () => {
    this.#filterComponent = new FilterView(this.#onSortByDateClick, this.#onSortByRatingClick, this.#onSortByDefaultClick);
    render(this.#filterComponent, this.#mainContainer);
  };

  #renderCard = (film) => {
    const filmPresenter = new FilmPresenter(this.#filmListContainer, this.#bodyContainer, this.#commentModel.comments);
    filmPresenter.init(film);

    this.#filmPresenters.push(filmPresenter);
  };

  #renderCards = (from, to) => {
    this.#films.slice(from, to).forEach((film) => {
      this.#renderCard(film, this.#filmListContainer);
      this.#renderedFilmsCount++;
    });
  };

  #renderShowMoreButton = () => {
    this.#showMoreButton = new ShowMoreButtonView(this.#onShowMoreButtonClick);
    render(this.#showMoreButton, this.#mainContainer);
  };

  #clearFilmList = () => {
    this.#filmPresenters.forEach((filmPresenter) => filmPresenter.destroy());
  };

  #onShowMoreButtonClick = () => {
    this.#renderCards(this.#renderedFilmsCount, this.#renderedFilmsCount + FILMS_COUNT_PER_STEP);

    if (this.#renderedFilmsCount === this.#films.length) {
      remove(this.#showMoreButton);
    }
  };

  #onSortByDateClick = () => {
    this.#changeSortType(SortType.DATE);
  };

  #onSortByRatingClick = () => {
    this.#changeSortType(SortType.RATING);
  };

  #onSortByDefaultClick = () => {
    this.#changeSortType(SortType.DEFAULT);
  };

  /**
   * @param {SortType} sortType
   */
  #changeSortType(sortType) {
    if (sortType === this.#currentSortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#filterComponent.changeCurrentSort(this.#currentSortType);
    this.#clearFilmList();
    const renderedFilmsCount = this.#renderedFilmsCount;
    this.#renderedFilmsCount = 0;
    switch (sortType) {
      case SortType.DATE:
        this.#films.sort((a, b) => b.date - a.date);
        break;

      case SortType.RATING:
        this.#films.sort((a, b) => b.rating - a.rating);
        break;

      default:
        this.#films = [...this.#filmsModel.films];
        break;
    }
    this.#renderCards(this.#renderedFilmsCount, renderedFilmsCount);

    if(!this.#mainContainer.contains(this.#showMoreButton.element) && this.#renderedFilmsCount !== this.#films.length) {
      this.#renderShowMoreButton();
    }
  }
}
