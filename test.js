const workouts = JSON.parse(localStorage.getItem('workouts'));
const form = document.querySelector('.form');
workouts.forEach(work => _renderWorkout(work));
let currEditElement;

function _renderWorkout(workout) {
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

const inputValues = document.querySelectorAll('.workout__value');
inputValues.forEach(span => {
  span.addEventListener('click', function () {
    showEditForm(span);
  });
});

function showEditForm(el) {
  document.querySelector('.edit__form').classList.remove('hidden');
  console.log(el.textContent);
  currEditElement = el;
  document.querySelector('.dynamic__input').value = el.textContent;
  document.querySelector('.dynamic__input').focus();
}

function hideEditForm() {
  document.querySelector('.edit__form').classList.add('hidden');
}

function editValue(e) {
  console.log('event: ', e);
}

document.querySelector('.dynamic__input').addEventListener('input', editSpan);

function editSpan(e) {
  e.preventDefault();
  currEditElement.innerText = e.target.value;
}

document.querySelector('.edit__form').addEventListener('submit', saveToStorage);

function saveToStorage(e) {
  e.preventDefault();
  const id =
    currEditElement.parentElement.parentElement.getAttribute('data-id');
  const storageWorkout = workouts.find(workout => workout.id === id);
  console.log(storageWorkout);
  const unitToEdit = currEditElement.getAttribute('data-unit');
  storageWorkout[unitToEdit] = +document.querySelector('.dynamic__input').value; // storageWorkout.speed
  localStorage.setItem('workouts', JSON.stringify(workouts));
  hideEditForm();
}
