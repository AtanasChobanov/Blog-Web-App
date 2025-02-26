document.addEventListener('DOMContentLoaded', function () {
  // Add animations or interactivity here
  const registerButton = document.querySelector('.register-button');
  const loginButton = document.querySelector('.login-button');

  registerButton.addEventListener('click', function (e) {
    e.preventDefault();
    console.log('Пренасочване към страницата за регистрация...');
    // Add redirection logic here
  });

  loginButton.addEventListener('click', function (e) {
    e.preventDefault();
    console.log('Пренасочване към страницата за вход...');
    // Add redirection logic here
  });

  // Add hover effects for feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    });
  });
});