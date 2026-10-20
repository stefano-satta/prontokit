import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

// Solo i moduli usati, per tenere piccolo il bundle della pagina
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PieController,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

Chart.defaults.font.family = "'Inter Variable', ui-sans-serif, system-ui, sans-serif";
Chart.defaults.font.size = 13;

export { Chart };
