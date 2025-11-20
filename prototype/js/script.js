const btn = document.getElementById('nav-toggle');
const menu = document.getElementById('mobile-menu');

if (btn && menu) {
    btn.addEventListener('click', () => {
        const opened = menu.classList.toggle('hidden') === false;
        btn.setAttribute('aria-expanded', String(opened));
    });
}