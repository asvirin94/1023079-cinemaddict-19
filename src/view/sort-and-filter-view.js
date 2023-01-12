import { SortType } from '../types.js';
import AbstractView from '../framework/view/abstract-view.js';
import { createFilterTemplate } from './sort-and-filter.template.js';

export default class FilterView extends AbstractView {
  #SORT_BUTTON_ACTIVE_CLASS = 'sort__button--active';

  #defaultLinkElement;
  #dateLinkElement;
  #ratingLinkElement;

  #onSortByDataClick;
  #onSortByRatingClick;
  #onSortByDefaultClick;

  constructor(onSortByDataClick, onSortByRatingClick, onSortByDefaultClick) {
    super();
    this.#onSortByDataClick = onSortByDataClick;
    this.#onSortByRatingClick = onSortByRatingClick;
    this.#onSortByDefaultClick = onSortByDefaultClick;

    this.defaultLinkElement.addEventListener('click', this.#onSortByDefaultClick);
    this.dateLinkElement.addEventListener('click', this.#onSortByDataClick);
    this.ratingLinkElement.addEventListener('click', this.#onSortByRatingClick);
  }

  get template() {
    return createFilterTemplate();
  }

  get defaultLinkElement() {
    if (!this.#defaultLinkElement) {
      this.#defaultLinkElement = this.element.querySelector('.sort-type-default');
    }
    return this.#defaultLinkElement;
  }

  get dateLinkElement() {
    if (!this.#dateLinkElement) {
      this.#dateLinkElement = this.element.querySelector('.sort-type-date');
    }
    return this.#dateLinkElement;
  }

  get ratingLinkElement() {
    if (!this.#ratingLinkElement) {
      this.#ratingLinkElement = this.element.querySelector('.sort-type-rating');
    }
    return this.#ratingLinkElement;
  }

  changeCurrentSort(sortType) {
    this.#defaultLinkElement.classList.remove(this.#SORT_BUTTON_ACTIVE_CLASS);
    this.#dateLinkElement.classList.remove(this.#SORT_BUTTON_ACTIVE_CLASS);
    this.#ratingLinkElement.classList.remove(this.#SORT_BUTTON_ACTIVE_CLASS);

    switch (sortType) {
      case SortType.DEFAULT:
        this.#defaultLinkElement.classList.add(this.#SORT_BUTTON_ACTIVE_CLASS);
        break;

      case SortType.DATE:
        this.#dateLinkElement.classList.add(this.#SORT_BUTTON_ACTIVE_CLASS);
        break;

      case SortType.RATING:
        this.#ratingLinkElement.classList.add(this.#SORT_BUTTON_ACTIVE_CLASS);
        break;
    }
  }
}
