'use strict';

const addBtn = document.getElementById('add-button');
const input = document.querySelector('#input-field');
const container = document.querySelector('.container-listings');
const tasksRadio = document.querySelector('#tasks');
const shoppingRadio = document.querySelector('#shopping');
const elements = document.getElementsByClassName('task-item');
const clearBtn = document.querySelector('#clear-button');
const saveBtn = document.querySelector('#save-button');
const listsContainer = document.querySelector('.my-lists');

const shortid = require('shortid');

class Activity {
  date;
  constructor(tasks, done) {
    this.tasks = tasks;
    this.done = done;
    this.id = shortid.generate();
    this.setTime();
  }

  setTime() {
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);

    this.date = `${day}.${month}, ${hour}:${min}`;
  }
}

class Task extends Activity {
  type = 'task';
  constructor(tasks, done) {
    super(tasks, done);
  }
}

class Shopping extends Activity {
  type = 'shopping';
  constructor(tasks, qty, done) {
    super(tasks, qty, done);
    this.qty = qty;
    this.done = done;
  }
}
class App {
  count = 1;
  shoppings = [];
  tasks = [];
  radioType;
  shoppingQuantity = [];
  doneArr = [];
  counter = [];
  lists = [];
  savedList = {
    id: '',
  };

  constructor() {
    this.setChecked();
    this.getRadioType();

    // this.reset();

    // get local storage
    this.getLocalStorage();

    // Attach event handlers //
    saveBtn.addEventListener('click', this.saveList.bind(this));
    document.addEventListener('click', this.renderSavedList.bind(this));
    document.addEventListener('click', this.done.bind(this));
    document.addEventListener('click', this.remove.bind(this));
    document.addEventListener('click', this.removeSavedList.bind(this));
    addBtn.addEventListener('click', this._newActivity.bind(this));
    clearBtn.addEventListener('click', this.clearHtml.bind(this));
    input.addEventListener('keyup', this.enterKey);
    shoppingRadio.addEventListener(
      'click',
      this.clearOnShoppingRadio.bind(this)
    );
    tasksRadio.addEventListener('click', this.clearOnTasksRadio.bind(this));
  }

  _newActivity() {
    this.render(this.radioType);
    this.disableRadio();
  }

  enterKey(e) {
    e.keyCode === 13 ? addBtn.click() : null;
  }

  getRadioType() {
    const form = document.forms.demo;
    const radios = form.elements.activity;
    const value = Array.from(radios).find(radio => radio.checked).value;
    return (this.radioType = value);
  }

  disableRadio() {
    tasksRadio.disabled = true;
    shoppingRadio.disabled = true;
  }

  enableRadio() {
    tasksRadio.disabled = false;
    shoppingRadio.disabled = false;
  }

  // Push listing string into corresponding array
  addNewListing(taskStr, radioType) {
    radioType === 'shopping'
      ? this.shoppings.push(taskStr)
      : this.tasks.push(taskStr);
  }

  setChecked() {
    tasksRadio.setAttribute('checked', 'checked');
  }

  // Delete listing from list
  remove(e) {
    const radioType = this.getRadioType();
    if (e.target && e.target.id === 'cls-btn') {
      e.target.closest('.row').remove();
      if (radioType === 'shopping') {
        const found = this.shoppings.find(el => e.target.dataset.id == el);
        const foundIndex = this.shoppings.indexOf(found);
        this.shoppings.splice(foundIndex, 1);
        if (this.savedList.id) {
          const foundList = this.lists.find(el => el.id === this.savedList.id);
          foundList.qty.splice(foundIndex, 1);
        }
      }
      if (radioType === 'tasks') {
        const found = this.tasks.find(el => e.target.dataset.id == el);
        const foundIndex = this.tasks.indexOf(found);
        this.tasks.splice(foundIndex, 1);
      }
      this.updateCount();
    }
  }

  // Toggle 'done' style of a listing
  done(e) {
    if (e.target && e.target.classList.contains('check--input')) {
      e.target.closest('.row').classList.toggle('done');
    }
  }

  updateCount() {
    const listingsCount = document.querySelectorAll('.div-count');
    let i = 1;
    listingsCount.forEach(el => {
      el.innerHTML = i;
      i++;
    });
  }

  render(radioType) {
    const str = input.value.toLowerCase();
    if (str === '') return;
    const taskStr = str[0].toUpperCase() + str.slice(1);
    this.addNewListing(taskStr, radioType);

    if (radioType === 'shopping') {
      container.insertAdjacentHTML(
        'beforeend',
        `<div class="row  listings-example shopping-listing task-item ">
      <div class="col-1  div-count list-group-item">${this.count}</div>
      <div class="col-md-7 col-6  list-group-item">${taskStr}</div>
      <input class="col-1 qty-input" data-idi="${taskStr}" placeholder="QTY" type="number">
      <div class=" col-md-2 col-2 done-label list-group-item">
                  <input class="form-check-input check--input " type="checkbox" value="" id="flexCheckDefault">
                  <label class="form-check-label done--label" for="flexCheckDefault">
                    Done
                  </label>
                </div>
      <div class="col-1  list-group-item"><button type="button" class="btn-close" data-id="${taskStr}" id="cls-btn" aria-label="Close"></div>
    </div>`
      );
    }
    if (radioType === 'tasks')
      container.insertAdjacentHTML(
        'beforeend',
        `<div class="row listings-example task-listing task-item">
        <div class="col-1  div-count list-group-item">${this.count}</div>
        <div class="col-md-8 col-5 list-group-item">${taskStr}</div>
        <div class=" col-md-2 col-4 done-label  list-group-item">
                  <input class="form-check-input check--input " type="checkbox" value="" id="flexCheckDefault">
                  <label class="form-check-label done--label" for="flexCheckDefault">
                    Done
                  </label>
                </div>
        <div class="col-1  list-group-item"><button type="button" class="btn-close" data-id="${taskStr}" id="cls-btn"  aria-label="Close"></div>
      </div>`
      );
    this.count++;
    input.value = '';
  }

  // Init function
  clearHtml() {
    for (let i = elements.length - 1; i >= 0; --i) {
      elements[i].remove();
    }
    this.enableRadio();
    this.count = 1;
    this.tasks = [];
    this.shoppings = [];
    this.shoppingQuantity = [];
    this.doneArr = [];
    this.savedList.id = '';
  }

  clearOnShoppingRadio() {
    this.radioType === 'shopping' ? null : this.clearHtml();
    tasksRadio.checked = false;
    shoppingRadio.checked = true;
  }

  clearOnTasksRadio() {
    this.radioType === 'tasks' ? null : this.clearHtml();
    tasksRadio.checked = true;
    shoppingRadio.checked = false;
  }

  pushDoneArr() {
    const elemArr = Array.from(elements);
    elemArr.forEach(el => {
      el.classList.contains('done')
        ? this.doneArr.push(1)
        : this.doneArr.push(-1);
    });
  }

  saveList() {
    const str = input.value;
    if (str === '' && this.tasks.length == 0 && this.shoppings.length == 0)
      return;

    // If we are editing an existing list
    if (this.savedList.id) {
      const found = this.lists.find(el => el.id === this.savedList.id);
      found.type === 'task'
        ? (found.tasks = this.tasks)
        : (found.tasks = this.shoppings);

      // Getting quantity values
      this.shoppings.forEach(elem => {
        const shoppingDomArr = document.querySelectorAll('.qty-input');
        shoppingDomArr.forEach(el => {
          el.setAttribute('value', el.value);
          el.dataset.idi === elem
            ? this.shoppingQuantity.push(el.getAttribute('value'))
            : null;
        });
      });
      found.qty = this.shoppingQuantity;

      this.pushDoneArr();
      found.done = this.doneArr;

      this.setLocalStorage();
      this.clearHtml();

      return;
    }

    this.pushDoneArr();
    // Getting quantity values
    this.shoppings.forEach(elem => {
      const shoppingDomArr = document.querySelectorAll('.qty-input');
      shoppingDomArr.forEach(el => {
        el.dataset.idi === elem ? this.shoppingQuantity.push(el.value) : null;
      });
    });
    // Creating new objects
    let list;
    if (this.radioType === 'tasks') {
      list = new Task(this.tasks, this.doneArr);
      this.lists.push(list);
    }
    if (this.radioType === 'shopping') {
      list = new Shopping(this.shoppings, this.shoppingQuantity, this.doneArr);
      this.lists.push(list);
    }
    // Adding list names to 'My list' btn
    listsContainer.insertAdjacentHTML(
      'beforeend',
      `<div class="saved-row list-group-item"><li><a class="dropdown-item saved-list d-inline" id="${
        list.id
      }" href="#">${list.type === 'task' ? 'Plan' : 'Shopping'} list - ${
        list.date
      }</a> <button type="button" class="btn-close list-remove" id=""  aria-label="Close"></li> </div>`
    );
    this.setLocalStorage();
    this.clearHtml();
  }

  renderSavedList(e) {
    if (e.target && e.target.classList.contains('saved-list')) {
      this.clearHtml();
      this.disableRadio();
      const found = this.lists.find(el => e.target.id === el.id);
      this.savedList.id = found.id;
      // Render each task of chosen list
      found.tasks.forEach(el => {
        if (found.type === 'shopping') {
          let index = found.tasks.indexOf(el);

          this.shoppings.push(el);
          container.insertAdjacentHTML(
            'beforeend',
            `<div class="row listings-example shopping-listing task-item ${
              found.done[index] === 1 ? 'done' : null
            }">
      <div class="col-1 bg-info div-count list-group-item">${this.count}</div>
      <div class="col-7 bg-danger list-group-item">${el}</div>
      <input class="col-1 qty-input" type="number" data-idi="${el}" value='${
              found.qty[index]
            }' placeholder='QTY'>
      <div class=" col-2 bg-secondary list-group-item">
                  <input class="form-check-input check--input " type="checkbox" value="" id="flexCheckDefault">
                  <label class="form-check-label" for="flexCheckDefault">
                    Done
                  </label>
                </div>
      <div class="col-1 bg-info list-group-item"><button type="button" class="btn-close" data-id="${el}" id="cls-btn" aria-label="Close"></div>
      `
          );
          this.setCheckbox(index, found);
          tasksRadio.checked = false;
          shoppingRadio.checked = true;
        }
        if (found.type === 'task') {
          let index = found.tasks.indexOf(el);
          this.tasks.push(el);
          container.insertAdjacentHTML(
            'beforeend',
            `<div class="row listings-example task-listing task-item ${
              found.done[index] === 1 ? 'done' : null
            }">
        <div class="col-1 bg-info div-count list-group-item">${this.count}</div>
        <div class="col-8 bg-secondary list-group-item">${el}</div>
        <div class=" col-2 bg-secondary list-group-item">
                  <input class="form-check-input check--input " type="checkbox" value="" id="flexCheckDefault">
                  <label class="form-check-label" for="flexCheckDefault">
                    Done
                  </label>
                </div>
        <div class="col-1 bg-info list-group-item"><button type="button" class="btn-close" data-id="${el}" id="cls-btn"  aria-label="Close"></div>
        `
          );
          this.setCheckbox(index, found);
          tasksRadio.checked = true;
          shoppingRadio.checked = false;
          this.radioType = 'tasks';
        }
        this.count++;
      });
    }
  }

  setCheckbox(index, found) {
    const checks = document.querySelectorAll('.check--input');
    found.done[index] === 1
      ? (checks[index].checked = true)
      : (checks[index].checked = false);
  }

  removeSavedList(e) {
    if (e.target && e.target.classList.contains('list-remove')) {
      const found = this.lists.find(el => e.target.id === el.id);
      const foundIndex = this.lists.indexOf(found);
      this.lists.splice(foundIndex, 1);
      const li = document.getElementById(`#${e.target.id}`);
      e.target.closest('.saved-row').remove();
      this.setLocalStorage();
      this.clearHtml();
    }
  }

  setLocalStorage() {
    localStorage.setItem('lists', JSON.stringify(this.lists));
  }

  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('lists'));
    if (!data) return;
    this.lists = data;
    this.lists.forEach(el => {
      listsContainer.insertAdjacentHTML(
        'beforeend',
        `<div class="saved-row list-group-item"><li><a class="dropdown-item saved-list d-inline" id="${
          el.id
        }" href="#">${el.type[0].toUpperCase() + el.type.slice(1)} list - ${
          el.date
        } </a><button type="button" class="btn-close list-remove" id="${
          el.id
        }"  aria-label="Close"> </li></div> `
      );
    });
  }

  reset() {
    localStorage.removeItem('lists');
  }
}
const app = new App();
