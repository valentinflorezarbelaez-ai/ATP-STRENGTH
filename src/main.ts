import './style.css';
import { AppController } from './ui/app-controller';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (root) {
    const controller = new AppController(root);
    controller.init();
  }
});
