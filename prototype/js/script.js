document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            const opened = menu.classList.toggle('hidden') === false;
            btn.setAttribute('aria-expanded', String(opened));
        });
    }

    const BASE_PRICE = 12.49;

    const minusBtn = document.getElementById('bestellen-min');
    const plusBtn = document.getElementById('bestellen-plus');
    const countInput = document.getElementById('bestellen-value');
    const summaryCount = document.getElementById('bestellen-aantal');
    const priceEls = Array.from(document.querySelectorAll('#bestellen-prijs-intotaal'));
    const shippingRadios = Array.from(document.querySelectorAll('input[name="shipping"]'));

    const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

    function parsePriceStringFromLabel(radio) {
        const label = radio.closest('label');
        if (!label) return 0;
        const m = label.textContent.match(/€\s?[\d.,]+/);
        if (!m) return 0;
        return parseFloat(m[0].replace('€', '').trim().replace('.', '').replace(',', '.')) || 0;
    }

    function getSelectedShippingCost() {
        const checked = shippingRadios.find(r => r.checked);
        if (!checked) return 0;

        if (checked.value != null && checked.value !== '') {
            const normalized = String(checked.value).replace(',', '.');
            const num = Number(normalized);
            if (Number.isFinite(num)) return num;
        }

        return parsePriceStringFromLabel(checked);
    }

    function sanitizeCount(v) {
        let n = Number(v);
        if (!Number.isFinite(n) || isNaN(n)) n = 1;
        n = Math.floor(n);
        if (n < 1) n = 1;
        return n;
    }

    function updateTotals() {
        const count = sanitizeCount(countInput.value);
        countInput.value = count;
        if (summaryCount) summaryCount.textContent = `Aantal: ${count}`;

        const shipping = getSelectedShippingCost();
        const total = (BASE_PRICE * count) + shipping;

        priceEls.forEach(el => el.textContent = fmt.format(total));
    }

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const current = sanitizeCount(countInput.value);
            countInput.value = Math.max(1, current - 1);
            updateTotals();
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            const current = sanitizeCount(countInput.value);
            countInput.value = current + 1;
            updateTotals();
        });
    }

    if (countInput) {
        countInput.addEventListener('input', () => {
            const sanitized = sanitizeCount(countInput.value);
            if (String(sanitized) !== countInput.value) {
                countInput.value = sanitized;
            }
            updateTotals();
        });

        countInput.addEventListener('blur', () => {
            countInput.value = sanitizeCount(countInput.value);
            updateTotals();
        });
    }

    shippingRadios.forEach(r => r.addEventListener('change', updateTotals));

    updateTotals();
});