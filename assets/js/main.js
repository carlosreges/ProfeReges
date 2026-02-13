/**
* Template Name: Siimple
* Updated: Mar 09 2023 with Bootstrap v5.2.3
* Template URL: https://bootstrapmade.com/free-bootstrap-landing-page/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function () {
  "use strict";

  /** 
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Mobile nav toggle
   */
  const toogleNav = function () {
    let navButton = select('.nav-toggle')
    navButton.classList.toggle('nav-toggle-active')
    navButton.querySelector('i').classList.toggle('bx-x')
    navButton.querySelector('i').classList.toggle('bx-menu')

    select('.nav-menu').classList.toggle('nav-menu-active')
  }
  on('click', '.nav-toggle', function (e) {
    toogleNav();
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.nav-menu .drop-down > a', function (e) {
    e.preventDefault()
    this.nextElementSibling.classList.toggle('drop-down-active')
    this.parentElement.classList.toggle('active')
  }, true)

  /**
   * Scrool links with a class name .scrollto
   */
  on('click', '.scrollto', function (e) {
    if (select(this.hash)) {
      select('.nav-menu .active').classList.remove('active')
      this.parentElement.classList.toggle('active')
      toogleNav();
    }
  }, true)

  // Manejar envío del formulario sin redirección
  document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = this;
    const button = document.getElementById('button');
    const originalText = button.textContent;
    
    // Cambiar estado del botón
    button.disabled = true;
    button.textContent = 'Enviando...';
    
    // Crear objeto FormData con los datos del formulario
    const formData = new FormData(form);
    
    // Enviar datos mediante fetch
    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      // Éxito
      button.textContent = '¡Mensaje Enviado!';
      button.classList.remove('btn-success');
      button.classList.add('btn-info');
      form.reset();

      const formMessage = document.getElementById('form-message');
      formMessage.innerHTML = '<div class="alert alert-success" role="alert">¡Tu mensaje ha sido enviado con éxito!</div>';
      formMessage.style.display = 'block';
      
      // Restaurar botón y ocultar mensaje después de 3 segundos
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('btn-info');
        button.classList.add('btn-success');
        formMessage.style.display = 'none';
        formMessage.innerHTML = '';
      }, 3000);
    })
    .catch(error => {
      // Error
      button.textContent = 'Error al enviar';
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');

      const formMessage = document.getElementById('form-message');
      formMessage.innerHTML = '<div class="alert alert-danger" role="alert">¡Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo!</div>';
      formMessage.style.display = 'block';
      
      // Restaurar botón y ocultar mensaje después de 3 segundos
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('btn-danger');
        button.classList.add('btn-success');
        formMessage.style.display = 'none';
        formMessage.innerHTML = '';
      }, 3000);
    });
  });

})()


