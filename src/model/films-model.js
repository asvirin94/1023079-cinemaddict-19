import Observable from '../framework/observable.js';

export default class FilmsModel extends Observable {
  #films = null;
  #filmsApiService;

  constructor({filmsApiService, mockFilms}) {
    super();
    this.#filmsApiService = filmsApiService;
    this.#films = mockFilms;

    this.#filmsApiService.films.then((films) => {
      console.log(films.map(this.#adaptToClient));
    });
  }

  get films() {
    return this.#films;
  }

  set films(films) {
    this.#films = films;
  }

  updateFilm(updatedType, update) {
    const index = this.#films.findIndex((film) => film.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting film');
    }

    this.#films = [
      ...this.#films.slice(0, index),
      update,
      ...this.#films.slice(index + 1)
    ];

    this._notify(updatedType, update);
  }

  #adaptToClient(film) {
    const adaptedFilm = {
      id: film['id'],
      comments: film['comments'],
      filmInfo: {
        ...film['film_info'],
        ageRating: film['film_info']['age_rating'],
        alternativeTitle: film['film_info']['alternative_title'],
        totalRating: film['film_info']['total_rating'],
        release: {
          date: film['film_info']['release']['date'],
          releaseCountry: film['film_info']['release']['release_country']
        }
      },
      userDetails: {
        ...film['user_details'],
        alreadyWatched: film['user_details']['already_watched'],
        watchingDate: film['user_details']['watching_date'],
      }
    };

    delete adaptedFilm['filmInfo']['age_rating'];
    delete adaptedFilm['filmInfo']['alternative_title'];
    delete adaptedFilm['filmInfo']['total_rating'];
    delete adaptedFilm['userDetails']['already_watched'];
    delete adaptedFilm['userDetails']['watching_date'];

    return adaptedFilm;
  }

}
