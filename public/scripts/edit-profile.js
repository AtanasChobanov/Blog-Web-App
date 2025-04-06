function openPopup() {
    document.getElementById('passwordPopup').style.display = 'flex';
    document.body.classList.add('popup-open');
}

function closePopup() {
    document.getElementById('passwordPopup').style.display = 'none';
    document.body.classList.remove('popup-open');
}

function openPicturePopup() {
    console.log("Opening picture popup");
    document.getElementById('picturePopup').style.display = 'flex';
    document.body.classList.add('popup-open');
}

function closePicturePopup() {
    document.getElementById('picturePopup').style.display = 'none';
    document.body.classList.remove('popup-open');
}

document.getElementById('fileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('fileContainer').style.background = `url(${event.target.result})`;
            document.querySelector('#fileContainer .file-label').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
});

function savePicture() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('profilePicture', fileInput.files[0]);

        fetch('/change-profile-picture?_method=PATCH', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Грешка при качване на снимката');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Грешка при качване на снимката');
            });
    } else {
        alert('Моля, изберете снимка');
    }
}

function deletePicture() {
    if (confirm('Сигурни ли сте, че искате да изтриете профилната си снимка?')) {
        fetch('/delete-profile-picture?_method=DELETE', {
            method: 'POST'
        })
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Грешка при изтриване на снимката');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Грешка при изтриване на снимката');
            });
    }
}

document.getElementById('passwordPopup').addEventListener('click', function (e) {
    if (e.target === this) {
        closePopup();
    }
});

document.getElementById('picturePopup').addEventListener('click', function (e) {
    if (e.target === this) {
        closePicturePopup();
    }
});