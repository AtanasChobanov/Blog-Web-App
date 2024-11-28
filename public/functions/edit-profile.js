function openPopup() {
    const popup = document.getElementById('passwordPopup');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function closePopup() {
    const popup = document.getElementById('passwordPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}
