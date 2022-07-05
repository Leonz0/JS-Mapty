'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                    'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}
    `;
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
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//////////////////////////////
// APPLICATION ARCHITECTURE //
//////////////////////////////

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const map = document.getElementById('map');
var mapIsclicked = false;

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user position
    this._getPosition();

    // Get user position
    this._getLocalStorage();

    // Get parameter to edit
    this._getParToEdit();

    // Attach event handlers
    map.addEventListener('click', function () {
      mapIsclicked = true;
      console.log(mapIsclicked);
    });

    if (mapIsclicked) {
      mapIsclicked = false;
      console.log('mapIsclicked');
      form.addEventListener('submit', this._newWorkout.bind(this));
    }

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleelevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getParToEdit() {
    console.log(mapIsclicked);
    let workoutDetails = document.getElementsByClassName('workout__details');
    const strg = JSON.parse(localStorage.getItem('workouts'));
    for (let i = 0; i < workoutDetails.length; i++) {
      workoutDetails[i].addEventListener('click', function (e) {
        //form.addEventListener('submit', console.log('subbbbb'));
        //console.log(mapIsclicked);
        let val = workoutDetails[i].getElementsByClassName('workout__value');
        let inVal = val[0].textContent;
        console.log(strg);
        const xy = strg[0].coords;
        //const { lat = xy[0], lng = xy[1] } = xy;
        //_findWorkoutById();
        console.log(xy);
        //console.log({ lat, lng });
        //console.log(val);
        //console.log(workoutDetails[i].parentNode);
        //console.log(workoutDetails[i]);
        form.classList.remove('hidden');
        inputDistance.focus();
        //this.#mapEvent(xy);
      });
    }
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
    //const strg = JSON.parse(localStorage.getItem('workouts'));
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    const data = JSON.parse(localStorage.getItem('workouts'));

    this.#workouts.forEach((work, i) => {
      this._renderWorkout(work);
      this._renderWorkoutMarker(work);
    });

    this._getParToEdit();
  }

  _showForm(mapE) {
    // if ((mapIsclicked = 1)) {
    //   form.addEventListener('submit', this._newWorkout.bind(this));
    //   mapIsclicked = 0;
    // }
    //const strg = JSON.parse(localStorage.getItem('workouts'));
    // const xy = strg[0].coords;
    // const { lat = xy[0], lng = xy[1] } = xy;
    // const j = { lat, lng };
    const letlang = mapE.letlang;
    // console.log(j);
    // console.log(letlang);

    this.#mapEvent = mapE;
    console.log(mapE);
    // if ((mapIsclicked = 1)) {
    //   form.addEventListener('submit', this._newWorkout.bind(this));
    //   mapIsclicked = 0;
    // }
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
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

  _toggleelevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    //console.log(this.#mapEvent.latlng);
    const { lat, lng } = this.#mapEvent.latlng;
    //const { lat, lng } = strg[0].coords;
    //console.log({ lat, lng });
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Input have to be positive number');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If worlout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Input have to be positive number');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + Clear input Fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
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

  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}"  data-id="${
      workout.id
    }">
  <h2 class="workout__title">${workout.description}</h2>
  <div class="workout__details">

    <span class="workout__icon">${
      workout.type === 'running' ? '🏃‍♂️' : 'CYC'
    } </span>
    <span class="workout__value" data-unit="distance" contenteditable="true">${
      workout.distance
    }</span>
    <span class="workout__unit">km</span>
  </div>
  <div class="workout__details" >
    <span class="workout__icon">⏱</span>
    <span class="workout__value" data-unit="duration" contenteditable="true">${
      workout.duration
    }</span>
    <span class="workout__unit">min</span>
  </div>`;

    if (workout.type === 'running')
      html += `
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value" data-unit="pace" contenteditable="true">${workout.pace.toFixed(
        1
      )}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value" data-unit="cadence" contenteditable="true">${
        workout.cadence
      }</span>
      <span class="workout__unit">spm</span>
    </div>
</li>`;

    if (workout.type === 'cycling')
      html += `
  <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value" data-unit="speed" contenteditable="true">${workout.speed.toFixed(
      1
    )}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value" data-unit="elevationGain" contenteditable="true">${
      workout.elevationGain
    }</span>
    <span  class="workout__unit">m</span>
  </div>
</li>`;

    // this._getParToEdit();
    form.insertAdjacentHTML('afterend', html);
  }

  _editWorkout() {}

  _findWorkoutById(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
  }

  _moveToPopup(e) {
    if (!this.#map) return;

    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));

    this._getParToEdit();
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;
    this.#workouts = data;
    // this.#workouts.forEach(work => {
    //   this._renderWorkout(work);
    // });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
