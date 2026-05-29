(function () {
  var toast = document.getElementById('toast');
  var toastTitle = toast ? toast.querySelector('.toast-title') : null;
  var toastDesc = toast ? toast.querySelector('.toast-desc') : null;
  var toastClose = toast ? toast.querySelector('.toast-close') : null;
  var toastTimer = null;

  function showToast(title, desc) {
    if (!toast) return;
    if (toastTitle) toastTitle.textContent = title;
    if (toastDesc) toastDesc.textContent = desc;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 5000);
  }

  if (toastClose) {
    toastClose.addEventListener('click', function () {
      toast.classList.remove('visible');
      clearTimeout(toastTimer);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function handleSubscribeForm(form, isPro) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input) return;
      var email = input.value.trim();
      if (!isValidEmail(email)) {
        input.style.borderColor = '#c0392b';
        setTimeout(function () {
          input.style.borderColor = '';
        }, 2000);
        return;
      }
      input.value = '';
      if (isPro) {
        showToast('Plan Gran Maestro activado', 'Te hemos enviado un enlace de pago a ' + email + '.');
      } else {
        showToast('¡Revisa tu inbox para confirmar!', 'Enviamos un correo a ' + email + '. Comprueba la carpeta de spam si no aparece.');
      }
    });
  }

  document.querySelectorAll('.form-subscribe').forEach(function (form) {
    handleSubscribeForm(form, false);
  });

  document.querySelectorAll('.form-subscribe-pro').forEach(function (form) {
    handleSubscribeForm(form, true);
  });

  document.querySelectorAll('.form-lead').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input) return;
      var email = input.value.trim();
      if (!isValidEmail(email)) {
        input.style.borderColor = '#c0392b';
        setTimeout(function () { input.style.borderColor = ''; }, 2000);
        return;
      }
      input.value = '';
      showToast('Guía en camino', 'Enviamos las 20 aperturas esenciales a ' + email + '.');
    });
  });
})();
