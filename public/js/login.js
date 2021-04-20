/* eslint-disable */
import axios from 'axios';

export async function login(email, password) {
  try {
    const res = await axios({
      method: 'POST', // the form type
      url: '/app/users/login', // the path to the url
      data: {
        // the data that is being passed
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (error) {
    console.log(error);
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/app/users/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (error) {
    console.log(error.response);
  }
};
