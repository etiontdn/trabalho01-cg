const overlay = document.getElementById('damage-overlay');
const duration = 500; // ms

export function takeDamage() {
  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
  }, duration);
}
