import { remove, render, RenderPosition, replace } from '../framework/render.js';
import { UpdateType, UserAction, SortType, DateFormat} from '../consts';
import { humanizeDate } from '../utils.js';
import FilmSectionView from '../view/film-section-view.js';
import FilmListContainerView from '../view/film-list-container-view.js';
import FilmListView from '../view/film-list-view.js';
import SortView from '../view/sort-view.js';
import ShowMoreBtnView from '../view/show-more-button-view.js';
import FiltersPresenter from './filter-presenter.js';
import FilmPresenter from './film-presenter.js';
import LoadingView from '../view/loading-view.js';
import UserProfileView from '../view/user-profile-view.js';
import EmptyFilmListView from '../view/empty-film-list-view.js';
import FooterStatisticsView from '../view/footer-statistic-view.js';

const DEFAULT_RENDERED_FILMS_QUANTITY = 5;
const FILMS_TO_RENDER_QUANTITY = 5;
const siteHeader = document.querySelector('.header');
const footerStatisticsContainer = document.querySelector('.footer__statistics');


export default class FilmListPresenter {
  #filmSectionComponent = new FilmSectionView();
  #filmListComponent = new FilmListView();
  #filmListContainerComponent = new FilmListContainerView();
  #loadingComponent = new LoadingView();
  #userProfileComponent = null;
  #sortComponent = null;
  #filmShowMoreBtnComponent = null;
  #filmsContainer = null;
  #filmsModel = null;
  /** @type {CommentsModel} */
  #commentsModel;
  #filterModel = null;
  #EmptyFilmListComponent = null;

  #filmPresenter = new Map();
  #filtersPresenter = null;
  #currentSortType = SortType.DEFAULT;
  #isLoading = true;

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
    this.#rerenderUserProfile();
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
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }
    const films = this.films;
    if (!films.length) {
      remove(this.#filmShowMoreBtnComponent);
      const prevEmptyListComonent = this.#EmptyFilmListComponent;
      this.#EmptyFilmListComponent = new EmptyFilmListView({filters: this.#filtersPresenter.filters, activeFilter: this.#filterModel.filter});

      if(prevEmptyListComonent === null) {
        render(this.#EmptyFilmListComponent, this.#filmsContainer);
        return;
      }

      remove(prevEmptyListComonent);
      render(this.#EmptyFilmListComponent, this.#filmsContainer);
      return;
    }

    if(this.#EmptyFilmListComponent !== null) {
      remove(this.#EmptyFilmListComponent);
    }

    const renderedFilmsQuantity = this.#filmListContainerComponent.element.children.length;
    const filmsToRender = films.slice().splice(renderedFilmsQuantity, toRenderQuantity);
    const commentRequests = filmsToRender.map((film) => this.#commentsModel.getFilmComments(film.id));
    Promise.all(commentRequests).then((comments) => {
      for (const [i, film] of filmsToRender.entries()) {
        this.#renderFilm({
          ...film,
          comments: comments[i],
        });
        const isLastFilm = film === films[films.length - 1];
        if (isLastFilm) {
          remove(this.#filmShowMoreBtnComponent);
          return;
        }
      }
    });
  }

  #rerenderUserProfile() {
    const watchedFilmsCount = this.#filtersPresenter.filters.history.filteredFilms.length;
    const prevUserProfileComponent = this.#userProfileComponent;

    this.#userProfileComponent = new UserProfileView({watchedFilmsCount: watchedFilmsCount});

    if (prevUserProfileComponent === null) {
      render(this.#userProfileComponent, siteHeader);
      return;
    }

    render(this.#userProfileComponent, siteHeader);
    replace(this.#userProfileComponent, prevUserProfileComponent);
    remove(prevUserProfileComponent);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#filmListComponent.element, RenderPosition.AFTERBEGIN);
  }

  #renderFilm(film) {
    const filmPresenter = new FilmPresenter({
      filmListContainer: this.#filmListContainerComponent.element,
      onDataChange: this.#handleViewAction
    });
    this.#commentsModel.getFilmComments(film.id).then((comments) => {
      filmPresenter.init({
        ...film,
        comments
      });
    });
    this.#filmPresenter.set(film.id, filmPresenter);
  }

  #renderFilters() {
    this.#filtersPresenter = new FiltersPresenter({
      filtersContainer: this.#filmsContainer,
      filterModel: this.#filterModel,
      filmsModel: this.#filmsModel
    });

    this.#filtersPresenter.init();
    this.#rerenderUserProfile();
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

  #renderShowMoreBtn() {
    this.#filmShowMoreBtnComponent = new ShowMoreBtnView({
      onClick: this.#handleLoadMoreButtonClick
    });
    render(this.#filmShowMoreBtnComponent, this.#filmListComponent.element);
  }

  #renderFooterStatistics() {
    render(new FooterStatisticsView({
      filmsQuantity: this.#filmsModel.films.length
    }), footerStatisticsContainer);
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
        this.#filmsModel.updateFilm(updateType, update);
        this.#commentsModel.deleteComment(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    this.#rerenderUserProfile();

    switch (updateType) {
      case UpdateType.PATCH:
        this.#commentsModel.getFilmComments(data.id).then((comments) => {
          this.#filmPresenter.get(data.id).init({
            ...data,
            comments
          });
        });
        break;
      case UpdateType.MINOR:
        this.clearFilmList();
        this.renderFilms(DEFAULT_RENDERED_FILMS_QUANTITY);
        break;
      case UpdateType.MAJOR:
        this.clearFilmList({resetSortType: true});
        this.renderFilms(DEFAULT_RENDERED_FILMS_QUANTITY);
        break;
      case UpdateType.INIT:
        this.#renderFooterStatistics();
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.renderFilms(DEFAULT_RENDERED_FILMS_QUANTITY);
        break;
    }
  };

}
