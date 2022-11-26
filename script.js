'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    // this.date = ...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
     'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

///////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form__submit');
const formEdit = document.querySelector('.form__submit');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
//const editBtn = document.querySelector('.edit__btn');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  #workoutId;
  #workoutEl;

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    formEdit.addEventListener('submit', this._editWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    //editBtn.addEventListener('click', this._toggleEditForm(editBtn));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    // if (!formEdit.classList.contains('hidden')) {
    //   formEdit.classList.add('hidden');
    // }
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
    const editBtns = document.querySelectorAll('.edit__btn');
    editBtns.forEach(btn => {
      btn.classList.add('hidden');
    });
  }

  _hideForm(form) {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _toggleEditForm(e) {
    e.stopPropagation();
    const currWorkout = this.#workouts.find(
      workout => workout.id === this.#workoutId
    );

    inputType.value = currWorkout.type;
    inputDistance.value = currWorkout.distance;
    inputDuration.value = currWorkout.duration;
    inputType.value === 'running'
      ? (inputCadence.value = currWorkout.cadence)
      : (inputElevation.value = currWorkout.elevationGain);

    formEdit.classList.toggle('hidden');
    e.target.textContent = formEdit.classList.contains('hidden')
      ? 'Edit'
      : 'Done';
    if (currWorkout.type === 'cycling') this._toggleElevationField();
    //e.target.textContent === 'Done' ? e.target.classList.add('hidden') : '';
    // if (e.target.classList.contains('edit__btn')) {
    //   console.log(e.target);
    //   return;
    // }
    console.log(e.target);
  }

  _editWorkout(e) {
    e.preventDefault();
    //if (this.#mapEvent?.latlng) return;

    console.log(this.#workoutId);
    console.log(this.#workoutEl);
    const currWorkout = this.#workouts.find(
      workout => workout.id === this.#workoutId
    );
    console.log(this.#workoutId);

    if (!currWorkout) return;

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    if (this.#mapEvent) console.log('++++++++');
    console.log(currWorkout);
    console.log(currWorkout.coords);

    // Get data from form
    const type = inputType.value;
    currWorkout.type = type;

    const distance = +inputDistance.value;
    currWorkout.distance = distance;

    const duration = +inputDuration.value;
    currWorkout.duration = duration;

    const j = {
      lat: currWorkout.coords[0],
      lng: currWorkout.coords[1],
    };
    let { lat, lng } = j;

    // console.log({ lat, lng });

    // this.#mapEvent ? ({ lat, lng } = this.#mapEvent.latlng) : '';

    if (this.#mapEvent) {
      console.log(this.#mapEvent.latlng);
      currWorkout.coords[0] = this.#mapEvent.latlng.lat;
      currWorkout.coords[1] = this.#mapEvent.latlng.lng;
      //[lat, lng] = this.#mapEvent.latlng;
    }

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      currWorkout.cadence = cadence;
      console.log('running');

      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      //workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      currWorkout.elevationGain = elevation;
      console.log('cycling');

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      //workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    //this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(currWorkout);

    // Render workout on list
    this._renderWorkout(currWorkout, currWorkout.id);

    // Hide form + clear input fields
    this._hideForm(formEdit);

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _newWorkout(e) {
    e.preventDefault();
    if (this.#workoutId) return;
    console.log('here');

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    console.log(this.#mapEvent.latlng);
    const { lat, lng } = this.#mapEvent.latlng;
    this.#mapEvent = undefined;
    console.log({ lat, lng });
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm(form);

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    console.log(L._layers);
    //if (this.#workouts.find(item => item.id === workout.id)) return;
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout, pastId = 0) {
    //const workoutId = workout.id;
    //const testid = this.#workouts.find(item => item.id === pastId);
    //console.log(testid);
    if (this.#workouts.find(item => item.id === pastId)) return;
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <button class="edit__btn hidden">Edit</button>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    //form.insertAdjacentHTML('afterend', html);
    form.insertAdjacentHTML('afterend', html);

    //editBtn.addEventListener('click', this._toggleEditForm.bind(this));
  }

  _moveToPopup(e) {
    //e.stopPropagation();
    if (!this.#map) {
      console.log('*****');
      return;
    }

    this.#workoutEl = e.target.closest('.workout');
    console.log(this.#workoutEl);

    if (!this.#workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === this.#workoutEl.dataset.id
    );
    this.#workoutId = workout.id;
    const editBtns = document.querySelectorAll('.edit__btn');
    const editBtn = this.#workoutEl.querySelector('.edit__btn');
    editBtns.forEach(btn => {
      btn.classList.add('hidden');
      //console.log(e.target);
      btn.textContent = 'Edit';
    });
    editBtn.classList.remove('hidden');
    editBtn.addEventListener('click', this._toggleEditForm.bind(this));
    if (
      !e.target.classList.contains('edit__btn') &&
      !editBtn.classList.contains('hidden')
    )
      console.log('toggle');
    //editBtn.classList.add('hidden');
    console.log(e.target);
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    console.log(this.#workouts);
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    data.forEach((workout, i) => {
      if (workout.type !== workout.description.split(' ')[0].toLowerCase()) {
        const typeToUpperCase =
          workout.type[0].toUpperCase() + workout.type.slice(1);
        workout.description =
          typeToUpperCase +
          ' ' +
          workout.description.substring(workout.description.indexOf(' '));
      }
      if (workout.type === 'running') {
        this.#workouts[i] = new Running(
          workout.coords,
          workout.distance,
          workout.duration,
          workout.cadence
        );
        this.#workouts[i].date = workout.date;
        this.#workouts[i].description = workout.description;
      }
      if (workout.type !== 'running') {
        this.#workouts[i] = new Cycling(
          workout.coords,
          workout.distance,
          workout.duration,
          workout.elevationGain
        );
        this.#workouts[i].date = workout.date;
        this.#workouts[i].description = workout.description;
      }
      this.#workouts[i].id = workout.id;
    });

    // console.log(data);
    console.log(this.#workouts);

    //this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
