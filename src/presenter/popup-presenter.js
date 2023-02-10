import PopupView from '../view/popup-view.js';
import { isEscPressed } from '../utils.js';
import { render } from '../framework/render';

/** @type {PopupPresenter} */
let openedPopup;

export default class PopupPresenter {
  /** @type {PopupView} */
  #filmPopupComponent;
  #film = null;

  constructor({ film, onControlBtnClick, onAddComment, onDeleteComment }) {
    this.#film = film;
    this.#filmPopupComponent = new PopupView({
      film: this.#film,
      onCloseClick: this.#handleCloseClick,
      onControlBtnClick,
      onAddComment,
      onDeleteComment
    });
  }

  showPopup() {
    if (openedPopup) {
      openedPopup.closePopup();
    }
    document.body.classList.add('hide-overflow');
    render(this.#filmPopupComponent, document.body);
    document.addEventListener('keydown', this.#closePopupKeydownHandler);
    openedPopup = this;
  }

  closePopup() {
    document.body.classList.remove('hide-overflow');
    this.#filmPopupComponent.closePopup();
    document.removeEventListener('keydown', this.#closePopupKeydownHandler);
    openedPopup = null;
  }

  #handleCloseClick = () => {
    this.closePopup();
  };

  #closePopupKeydownHandler = (evt) => {
    if (isEscPressed(evt)) {
      this.closePopup();
    }
  };
}
