const toastEl = document.getElementById('loginToast');
const toastBody = document.getElementById('toastBody');
const bsToast = new bootstrap.Toast(toastEl);

// helper to show toast
function show(message, success = true) {
  toastEl.classList.toggle('text-bg-success', success);
  toastEl.classList.toggle('text-bg-danger', !success);
  toastBody.textContent = message;
  bsToast.show();
}

// SIGNUP
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(signupForm);
    if (form.get('password') !== form.get('confirm'))
      return show('Passwords do not match.', false);
    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
      }),
    });
    const data = await res.json();
    show(data.message, data.success);
    if (data.success) setTimeout(() => location.assign('/'), 1500);
  });
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(loginForm);
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
      }),
    });
    const data = await res.json();
    show(data.message, data.success);
    if (data.success) setTimeout(() => alert('Proceed to dashboard'), 1000);
  });
}
