import { remove, render } from '../framework/render.js';
import { UpdateType, UserAction, SortType, DateFormat} from '../consts';
import { humanizeDate } from '../utils.js';
import FilmSectionView from '../view/film-section-view.js';
import FilmListContainerView from '../view/film-list-container-view.js';
import FilmListView from '../view/film-list-view.js';
import LoadingPageView from '../view/loading-page-view.js';
import SortView from '../view/sort-view.js';
import ShowMoreBtnView from '../view/show-more-button-view.js';
import FiltersPresenter from './filter-presenter.js';
import FilmPresenter from './film-presenter.js';

const DEFAULT_RENDERED_FILMS_QUANTITY = 5;
const FILMS_TO_RENDER_QUANTITY = 5;

export default class FilmListPresenter {
  #filmSectionComponent = new FilmSectionView();
  #filmListComponent = new FilmListView();
  #filmListContainerComponent = new FilmListContainerView();
  #sortComponent = null;
  #filmShowMoreBtnComponent = null;
  #filmsContainer = null;
  #filmsModel = null;
  #commentsModel = null;
  #filterModel = null;

  #renderedFilmsCollection = this.#filmListContainerComponent.element.children;
  #filmPresenter = new Map();
  #filtersPresenter = null;
  #currentSortType = SortType.DEFAULT;

  constructor({filmsContainer, filmsModel, commentsModel, filterModel}) {
    this.#filmsContainer = filmsContainer;
    this.#filmsModel = filmsModel;
    this.#commentsModel = commentsModel;
    this.#filterModel = filterModel;

    this.#filmsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  get films() {
    const filterType = this.#filterModel.filter;
    const filteredFilms = this.#filtersPresenter.filters[filterType].filteredFilms;

    switch (this.#currentSortType) {
      case SortType.DATE:
        return filteredFilms.sort((a, b) => humanizeDate(b.filmInfo.release.date, DateFormat.FILM_CARD) - humanizeDate(a.filmInfo.release.date, DateFormat.FILM_CARD));
      case SortType.RATING:
        return filteredFilms.sort((a, b) => b.filmInfo.totalRating - a.filmInfo.totalRating);
      default:
        return filteredFilms;
    }
  }

  get comments() {
    return this.#commentsModel.comments;
  }

  init() {
    this.#renderFilters();
    if (this.films.length === 0) {
      this.#renderFilmsContainers();
      this.#renderEmptyFilmList();
      return;
    }
    this.#renderSort();
    this.#renderFilmsContainers();
    this.renderFilms(DEFAULT_RENDERED_FILMS_QUANTITY);
    this.#renderShowMoreBtn();
  }

  clearFilmList({resetSortType = false} = {}) {
    this.#filmPresenter.forEach((presenter) => presenter.destroy());
    this.#filmPresenter.clear();

    remove(this.#filmShowMoreBtnComponent);
    this.#renderShowMoreBtn();

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
      this.#setActiveSortButton(this.#sortComponent.element.querySelector('.sort__button[data-sort-type="default"]'));
    }
  }

  renderFilms(toRenderQuantity) {
    const filmsToRender = this.films;
    const renderedFilmsQuantity = this.#renderedFilmsCollection.length;
    for (let i = renderedFilmsQuantity; i < renderedFilmsQuantity + toRenderQuantity; i++) {
      this.#renderFilm(filmsToRender[i]);
      const isLastFilm = !filmsToRender[this.#renderedFilmsCollection.length];
      if (isLastFilm) {
        remove(this.#filmShowMoreBtnComponent);
        return;
      }
    }
  }

  #renderFilm(film) {
    const filmPresenter = new FilmPresenter({
      filmListContainer: this.#filmListContainerComponent.element,
      onDataChange: this.#handleViewAction
    });
    filmPresenter.init(film, this.comments);
    this.#filmPresenter.set(film.id, filmPresenter);
  }

  #renderFilters() {
    this.#filtersPresenter = new FiltersPresenter({
      filtersContainer: this.#filmsContainer,
      filterModel: this.#filterModel,
      filmsModel: this.#filmsModel
    });

    this.#filtersPresenter.init();
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType
    });

    render(this.#sortComponent, this.#filmsContainer);
  }

  #renderFilmsContainers() {
    render(this.#filmSectionComponent, this.#filmsContainer);
    render(this.#filmListComponent, this.#filmSectionComponent.element);
    render(this.#filmListContainerComponent, this.#filmListComponent.element);
  }

  #renderEmptyFilmList() {
    render(new LoadingPageView({
      filters: this.#filtersPresenter.filters,
      activeFilter: this.#filtersPresenter.activeFilter
    }), this.#filmSectionComponent.element);
  }

  #renderShowMoreBtn() {
    this.#filmShowMoreBtnComponent = new ShowMoreBtnView({
      onClick: this.#handleLoadMoreButtonClick
    });
    render(this.#filmShowMoreBtnComponent, this.#filmListComponent.element);
  }

  #setActiveSortButton(button) {
    this.#sortComponent.element.querySelector('.sort__button--active').classList.remove('sort__button--active');
    button.classList.add('sort__button--active');
  }

  #handleSortTypeChange = (button, sortType) => {
    this.clearFilmList();
    this.#currentSortType = sortType;
    this.#setActiveSortButton(button);
    this.renderFilms(DEFAULT_RENDERED_FILMS_QUANTITY);
  };

  #handleLoadMoreButtonClick = () => {
    this.renderFilms(FILMS_TO_RENDER_QUANTITY);
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this.#filmsModel.updateFilm(updateType, update);
        break;
      case UserAction.ADD_COMMENT:
        this.#filmsModel.updateFilm(updateType, update);
        this.#commentsModel.addComment(updateType, update);
        break;
      case UserAction.DELETE_COMMENT:
        this.#commentsModel.deleteComment(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    const toRenderQuantity = this.#renderedFilmsCollection.length < DEFAULT_RENDERED_FILMS_QUANTITY ? DEFAULT_RENDERED_FILMS_QUANTITY : this.#renderedFilmsCollection.length;

    switch (updateType) {
      case UpdateType.PATCH:
        this.#filmPresenter.get(data.id).init(data, this.comments);
        break;
      case UpdateType.MINOR:
        this.clearFilmList();
        this.renderFilms(toRenderQuantity);
        break;
      case UpdateType.MAJOR:
        this.clearFilmList({resetSortType: true});
        this.renderFilms(DEFAULT_RENDERED_FILMS_QUANTITY);
        break;
    }
  };

}
