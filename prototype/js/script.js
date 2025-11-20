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

    const donatePreset5 = document.getElementById('donatie-5');
    const donatePreset10 = document.getElementById('donatie-10');
    const donatePreset25 = document.getElementById('donatie-25');
    const donateInput = document.getElementById('amount');
    const donateSubmit = document.getElementById('donate-submit');

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
        if (!Number.isFinite(n) || isNaN(n)) n = 0; // allow 0 aantal
        n = Math.floor(n);
        if (n < 0) n = 0;
        return n;
    }

    function sanitizeDonation(v) {
        if (v == null || v === '') return 0;
        const s = String(v).replace(',', '.').trim();
        const n = Number(s);
        if (!Number.isFinite(n) || isNaN(n) || n < 0) return 0;
        return Math.round(n * 100) / 100;
    }

    function getDonationAmount() {
        if (!donateInput) return 0;
        return sanitizeDonation(donateInput.value);
    }

    function updateTotals() {
        const count = countInput ? sanitizeCount(countInput.value) : 0;
        if (countInput) countInput.value = count;
        if (summaryCount) summaryCount.textContent = `Aantal: ${count}`;

        const shipping = getSelectedShippingCost();
        const donation = getDonationAmount();
        const total = (BASE_PRICE * count) + shipping + donation;

        priceEls.forEach(el => el.textContent = fmt.format(total));
    }

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const current = sanitizeCount(countInput.value);
            countInput.value = Math.max(0, current - 1);
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

    function setDonationAndUpdate(value) {
        if (!donateInput) return;
        donateInput.value = String(value);
        updateTotals();
        donateInput.focus();
        donateInput.select && donateInput.select();
    }

    if (donatePreset5) donatePreset5.addEventListener('click', () => setDonationAndUpdate(5));
    if (donatePreset10) donatePreset10.addEventListener('click', () => setDonationAndUpdate(10));
    if (donatePreset25) donatePreset25.addEventListener('click', () => setDonationAndUpdate(25));

    if (donateInput) {
        donateInput.addEventListener('input', () => {
            const sanitized = sanitizeDonation(donateInput.value);
            if (donateInput.value !== '' && String(sanitized) !== donateInput.value) {
            }
            updateTotals();
        });

        donateInput.addEventListener('blur', () => {
            donateInput.value = String(sanitizeDonation(donateInput.value));
            updateTotals();
        });
    }

    if (donateSubmit) {
        donateSubmit.addEventListener('click', () => {
            if (!donateInput) return;
            donateInput.value = String(sanitizeDonation(donateInput.value));
            updateTotals();
            try {
                const msg = document.createElement('div');
                msg.className = 'sr-only';
                msg.setAttribute('role', 'status');
                msg.textContent = `Donatie van ${fmt.format(getDonationAmount())} toegevoegd.`;
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 3000);
            } catch (e) { }
        });
    }

    shippingRadios.forEach(r => r.addEventListener('change', updateTotals));

    updateTotals();
});