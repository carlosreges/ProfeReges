/**
 * Simulacro de Lengua - Prof. Carlos Reges
 * Motor de la prueba: cronómetro, progreso, corrección al final y reintentar.
 * Sin dependencias. Todo se configura con atributos data-* en el HTML.
 */
(function () {
  "use strict";

  var form = document.getElementById("form-prueba");
  if (!form) return;

  var DURACION_SEG = 90 * 60; // 90 minutos (prueba de ingreso completa)
  var restantes = DURACION_SEG;
  var intervalo = null;
  var corregido = false;

  var elTiempo = document.getElementById("tiempo");
  var cajaTiempo = document.getElementById("caja-tiempo");
  var elProgreso = document.getElementById("progreso");
  var listaOrden = document.getElementById("orden-seq");
  var PUNTOS_ORDEN = parseInt(listaOrden.getAttribute("data-puntos-item"), 10) || 1;

  // Total dinámico de la prueba: suma de data-puntos + ítems del orden.
  var TOTAL_PUNTOS = 0;
  Array.prototype.forEach.call(form.querySelectorAll("[data-puntos]"), function (el) {
    TOTAL_PUNTOS += parseInt(el.getAttribute("data-puntos"), 10) || 0;
  });
  TOTAL_PUNTOS += listaOrden.querySelectorAll(".prueba-orden-item").length * PUNTOS_ORDEN;

  // Orden inicial (revuelto) de los fragmentos, para poder restaurarlo al reintentar.
  var ordenInicial = Array.prototype.map.call(
    listaOrden.querySelectorAll(".prueba-orden-item"),
    function (li) { return li.getAttribute("data-id"); }
  );

  /* ---------- Utilidades ---------- */

  function normalizar(txt) {
    return (txt || "")
      .toString()
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
      .replace(/[.,;:¡!¿?"«»()]/g, "")
      .replace(/\s+/g, " ");
  }

  function fmt(seg) {
    var m = Math.floor(seg / 60);
    var s = seg % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ---------- Cronómetro ---------- */

  function pintarTiempo() {
    elTiempo.textContent = fmt(restantes);
    cajaTiempo.classList.toggle("tiempo-bajo", restantes <= 300);
  }

  function tick() {
    restantes--;
    if (restantes <= 0) {
      restantes = 0;
      pintarTiempo();
      detenerTiempo();
      if (typeof window.corregirPrueba === "function") { window.corregirPrueba(true); }
      return;
    }
    pintarTiempo();
  }

  function arrancarTiempo() {
    detenerTiempo();
    intervalo = setInterval(tick, 1000);
  }

  function detenerTiempo() {
    if (intervalo) { clearInterval(intervalo); intervalo = null; }
  }

  /* ---------- Progreso ---------- */

  function actualizarProgreso() {
    var total = 0;
    var respondidas = 0;

    Array.prototype.forEach.call(form.querySelectorAll(".prueba-pregunta"), function (q) {
      var tipo = q.getAttribute("data-tipo");
      total++;
      if (tipo === "opcion" || tipo === "vf") {
        if (q.querySelector("input:checked")) respondidas++;
      } else if (tipo === "relacion") {
        if (q.querySelector("select").value !== "") respondidas++;
      }
    });

    Array.prototype.forEach.call(form.querySelectorAll(".prueba-blank"), function (inp) {
      total++;
      if (inp.value.trim() !== "") respondidas++;
    });

    // Ejercicio de orden: se cuenta como respondido si el usuario lo tocó.
    total++;
    if (listaOrden.getAttribute("data-tocado") === "1") respondidas++;

    elProgreso.textContent = respondidas + " / " + total;
  }

  form.addEventListener("change", actualizarProgreso);
  form.addEventListener("input", actualizarProgreso);

  /* ---------- Etiquetas de posición en el ejercicio de orden ---------- */

  function numerarOrden() {
    Array.prototype.forEach.call(listaOrden.children, function (li, i) {
      li.querySelector(".orden-num").textContent = (i + 1);
    });
  }

  /* ---------- Botones de movimiento ---------- */

  listaOrden.addEventListener("click", function (e) {
    var btn = e.target.closest(".orden-btn");
    if (!btn || corregido) return;
    var li = btn.closest(".prueba-orden-item");
    var dir = btn.getAttribute("data-dir");
    if (dir === "up" && li.previousElementSibling) {
      listaOrden.insertBefore(li, li.previousElementSibling);
    } else if (dir === "down" && li.nextElementSibling) {
      listaOrden.insertBefore(li.nextElementSibling, li);
    }
    listaOrden.setAttribute("data-tocado", "1");
    numerarOrden();
  });

  /* ---------- Arrastrar y soltar ---------- */

  var arrastrado = null;

  listaOrden.addEventListener("dragstart", function (e) {
    var li = e.target.closest(".prueba-orden-item");
    if (!li || corregido) return;
    arrastrado = li;
    li.classList.add("arrastrando");
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; }
  });

  listaOrden.addEventListener("dragover", function (e) {
    if (!arrastrado) return;
    e.preventDefault();
    var li = e.target.closest(".prueba-orden-item");
    if (!li || li === arrastrado) return;
    var rect = li.getBoundingClientRect();
    var despues = (e.clientY - rect.top) > rect.height / 2;
    listaOrden.insertBefore(arrastrado, despues ? li.nextElementSibling : li);
    numerarOrden();
  });

  listaOrden.addEventListener("drop", function (e) { e.preventDefault(); });

  listaOrden.addEventListener("dragend", function () {
    if (arrastrado) {
      arrastrado.classList.remove("arrastrando");
      arrastrado = null;
      listaOrden.setAttribute("data-tocado", "1");
      numerarOrden();
    }
  });

  window.__prueba = {
    normalizar: normalizar,
    arrancarTiempo: arrancarTiempo,
    detenerTiempo: detenerTiempo,
    numerarOrden: numerarOrden,
    ordenInicial: ordenInicial,
    actualizarProgreso: actualizarProgreso,
    getRestantes: function () { return restantes; },
    reiniciarTiempo: function () {
      restantes = DURACION_SEG;
      pintarTiempo();
      arrancarTiempo();
    },
    setCorregido: function (v) { corregido = v; },
    estaCorregido: function () { return corregido; },
    DURACION_SEG: DURACION_SEG,
    TOTAL_PUNTOS: TOTAL_PUNTOS
  };

  numerarOrden();
  pintarTiempo();
  actualizarProgreso();
  arrancarTiempo();
})();

/**
 * Parte 2: corrección al final, resultado, reintentar e impresión.
 */
(function () {
  "use strict";

  var api = window.__prueba;
  if (!api) return;

  var form = document.getElementById("form-prueba");
  if (!form) return;

  var listaOrden = document.getElementById("orden-seq");
  var btnCorregir = document.getElementById("btn-corregir");
  var btnReintentar = document.getElementById("btn-reintentar");
  var btnImprimir = document.getElementById("btn-imprimir");
  var resultado = document.getElementById("resultado");
  var cajaPuntaje = document.getElementById("caja-puntaje");
  var elPuntaje = document.getElementById("puntaje");

  var ICON_OK = "\u2713";
  var ICON_BAD = "\u2717";

  function respuestaCorrectaTexto(pregunta, tipo) {
    var esperada = pregunta.getAttribute("data-respuesta");
    if (tipo === "relacion") {
      var opt = pregunta.querySelector('select option[value="' + esperada + '"]');
      return opt ? opt.textContent.trim() : esperada;
    }
    var input = pregunta.querySelector('input[value="' + esperada + '"]');
    if (input && input.nextElementSibling) return input.nextElementSibling.textContent.trim();
    return esperada;
  }

  function setFeedback(el, ok, texto) {
    el.hidden = false;
    el.textContent = texto;
    el.classList.toggle("fb-ok", ok);
    el.classList.toggle("fb-bad", !ok);
  }

  function contarSinResponder() {
    var sin = 0;
    Array.prototype.forEach.call(form.querySelectorAll(".prueba-pregunta"), function (q) {
      var tipo = q.getAttribute("data-tipo");
      if (tipo === "relacion") {
        if (q.querySelector("select").value === "") sin++;
      } else if (!q.querySelector("input:checked")) {
        sin++;
      }
    });
    Array.prototype.forEach.call(form.querySelectorAll(".prueba-blank"), function (inp) {
      if (inp.value.trim() === "") sin++;
    });
    return sin;
  }

  function desactivar() {
    Array.prototype.forEach.call(
      form.querySelectorAll("input, select"),
      function (el) { el.disabled = true; }
    );
    listaOrden.classList.add("orden-bloqueado");
  }

  function corregir(porTiempo) {
    if (api.estaCorregido()) return;

    if (!porTiempo) {
      var sin = contarSinResponder();
      if (sin > 0 && !window.confirm("Te quedan " + sin + " respuesta" + (sin === 1 ? "" : "s") +
          " sin completar. ¿Corregir la prueba igual?")) {
        return;
      }
    }

    api.setCorregido(true);
    api.detenerTiempo();

    var puntos = 0;
    var aciertos = 0;
    var fallidos = 0;
    var sinResponder = 0;
    var puntosOrden = api.PUNTOS_ORDEN;

    // Selección múltiple, verdadero/falso y relacionar
    Array.prototype.forEach.call(form.querySelectorAll(".prueba-pregunta"), function (q) {
      var tipo = q.getAttribute("data-tipo");
      var esperada = q.getAttribute("data-respuesta");
      var pts = parseInt(q.getAttribute("data-puntos"), 10) || 0;
      var fb = q.querySelector(".prueba-feedback");
      var valor = null;

      if (tipo === "relacion") {
        valor = q.querySelector("select").value;
      } else {
        var marcado = q.querySelector("input:checked");
        valor = marcado ? marcado.value : null;
      }

      q.classList.remove("ok", "bad", "vacia");

      if (valor === null || valor === "") {
        sinResponder++;
        q.classList.add("vacia");
        setFeedback(fb, false, ICON_BAD + " Sin responder. Respuesta correcta: " + respuestaCorrectaTexto(q, tipo));
      } else if (valor === esperada) {
        aciertos++;
        puntos += pts;
        q.classList.add("ok");
        setFeedback(fb, true, ICON_OK + " Correcto");
      } else {
        fallidos++;
        q.classList.add("bad");
        setFeedback(fb, false, ICON_BAD + " Incorrecto. Respuesta correcta: " + respuestaCorrectaTexto(q, tipo));
      }
    });

    // Completar el texto
    Array.prototype.forEach.call(form.querySelectorAll(".prueba-blank"), function (inp) {
      var pts = parseInt(inp.getAttribute("data-puntos"), 10) || 0;
      var fb = inp.parentNode.querySelector(".prueba-feedback-inline");
      var valor = api.normalizar(inp.value);
      var aceptadas = (inp.getAttribute("data-accept") || "").split("|").map(api.normalizar);
      inp.classList.remove("ok", "bad", "vacia");

      if (valor === "") {
        sinResponder++;
        inp.classList.add("vacia");
        setFeedback(fb, false, ICON_BAD + " Respuesta: " + inp.getAttribute("data-answer"));
      } else if (aceptadas.indexOf(valor) !== -1) {
        aciertos++;
        puntos += pts;
        inp.classList.add("ok");
        setFeedback(fb, true, ICON_OK);
      } else {
        fallidos++;
        inp.classList.add("bad");
        setFeedback(fb, false, ICON_BAD + " Respuesta: " + inp.getAttribute("data-answer"));
      }
    });

    // Ordenar la secuencia
    var items = listaOrden.querySelectorAll(".prueba-orden-item");
    var bienUbicados = 0;
    Array.prototype.forEach.call(items, function (li, i) {
      var ok = (parseInt(li.getAttribute("data-id"), 10) === i + 1);
      li.classList.remove("ok", "bad");
      li.classList.add(ok ? "ok" : "bad");
      if (ok) bienUbicados++;
    });
    puntos += bienUbicados * puntosOrden;
    if (bienUbicados === items.length) { aciertos++; } else { fallidos++; }
    var fbOrden = document.getElementById("feedback-orden");
    setFeedback(fbOrden, bienUbicados === items.length,
      (bienUbicados === items.length ? ICON_OK + " Secuencia correcta" :
        ICON_BAD + " " + bienUbicados + " de " + items.length + " fragmentos en su lugar. Mirá el orden 1 a 5 para corregirlo."));

    desactivar();
    btnCorregir.hidden = true;
    btnReintentar.hidden = false;

    // Resultado
    var total = api.TOTAL_PUNTOS;
    var pct = Math.round((puntos / total) * 100);
    var usados = api.DURACION_SEG - api.getRestantes();
    var min = Math.floor(usados / 60);
    var seg = usados % 60;

    elPuntaje.textContent = puntos + " / " + total + " puntos";
    cajaPuntaje.hidden = false;

    var mensaje = "";
    if (pct >= 90) {
      mensaje = "¡Excelente! Dominás la comprensión lectora y la estructura del relato.";
    } else if (pct >= 70) {
      mensaje = "¡Muy bien! Vas por buen camino; revisá solo algunos detalles.";
    } else if (pct >= 50) {
      mensaje = "Aprobás, pero conviene repasar el texto y los conceptos del relato.";
    } else {
      mensaje = "No te desanimes: releé el texto con calma y volvé a intentarlo.";
    }
    if (porTiempo) {
      mensaje = "Se acabó el tiempo. " + mensaje;
    }
    document.getElementById("resultado-puntaje").textContent = puntos + " / " + total + " puntos (" + pct + "%)";
    document.getElementById("resultado-mensaje").textContent = mensaje;
    document.getElementById("resultado-detalle").textContent =
      "Correctas: " + aciertos + " · Incorrectas: " + fallidos + " · Sin responder: " + sinResponder +
      " · Tiempo: " + min + " min " + (seg < 10 ? "0" : "") + seg + " s";

    resultado.hidden = false;
    resultado.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  window.corregirPrueba = corregir;
  btnCorregir.addEventListener("click", function () { corregir(false); });
  btnImprimir.addEventListener("click", function () { window.print(); });

  btnReintentar.addEventListener("click", function () {
    api.setCorregido(false);
    form.reset();

    // Limpia la corrección visual
    Array.prototype.forEach.call(form.querySelectorAll(".prueba-pregunta"), function (q) {
      q.classList.remove("ok", "bad", "vacia");
      var fb = q.querySelector(".prueba-feedback");
      if (fb) { fb.hidden = true; fb.textContent = ""; fb.className = "prueba-feedback"; }
    });
    Array.prototype.forEach.call(form.querySelectorAll(".prueba-blank"), function (inp) {
      inp.classList.remove("ok", "bad", "vacia");
      var fb = inp.parentNode.querySelector(".prueba-feedback-inline");
      if (fb) { fb.hidden = true; fb.textContent = ""; fb.className = "prueba-feedback-inline"; }
    });
    var fbOrden = document.getElementById("feedback-orden");
    fbOrden.hidden = true;
    fbOrden.textContent = "";
    fbOrden.className = "prueba-feedback";

    // Restaura el orden inicial (revuelto) de los fragmentos
    api.ordenInicial.forEach(function (id) {
      var li = listaOrden.querySelector('.prueba-orden-item[data-id="' + id + '"]');
      if (li) listaOrden.appendChild(li);
    });
    Array.prototype.forEach.call(listaOrden.querySelectorAll(".prueba-orden-item"), function (li) {
      li.classList.remove("ok", "bad");
    });
    listaOrden.removeAttribute("data-tocado");
    api.numerarOrden();
    listaOrden.classList.remove("orden-bloqueado");

    // Reactiva los controles
    Array.prototype.forEach.call(form.querySelectorAll("input, select"), function (el) {
      el.disabled = false;
    });

    resultado.hidden = true;
    cajaPuntaje.hidden = true;
    btnCorregir.hidden = false;
    btnReintentar.hidden = true;
    api.actualizarProgreso();
    api.reiniciarTiempo();

    var estado = document.querySelector(".prueba-estado");
    if (estado) estado.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
