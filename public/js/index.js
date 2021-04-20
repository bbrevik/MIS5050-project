/* eslint-disable */

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
// import { updateSettings } from './updateSettings';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

if (mapBox) {
  const allLocations = JSON.parse(mapBox.dataset.locations);
  displayMap(allLocations);
}

if (loginForm)
  loginForm.addEventListener('submit', (item) => {
    item.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // console.log(email);
    //   console.log(password);
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);
