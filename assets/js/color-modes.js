(() => {
  'use strict'

  const root = document.documentElement
  const toggle = document.querySelector('.theme-toggle')
  const storedTheme = localStorage.getItem('profereges-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const setTheme = (theme) => {
    root.dataset.theme = theme
    if (toggle) {
      const dark = theme === 'dark'
      toggle.setAttribute('aria-pressed', String(dark))
      toggle.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro')
      toggle.innerHTML = dark ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>'
    }
  }

  setTheme(storedTheme || (prefersDark ? 'dark' : 'light'))

  if (toggle) {
    toggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('profereges-theme', nextTheme)
      setTheme(nextTheme)
    })
  }
})()
