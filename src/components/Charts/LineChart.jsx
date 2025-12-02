// LineChart.jsx - Componente de gráfico de líneas
import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ 
  data, 
  title = 'Gráfico de Líneas',
  height = 300,
  showLegend = true,
  gradient = true 
}) => {
  const chartRef = useRef(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Aplicar gradiente si está habilitado
  useEffect(() => {
    if (gradient && chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      
      const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
      gradientFill.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradientFill.addColorStop(1, 'rgba(139, 92, 246, 0)');
      
      if (chart.data.datasets[0]) {
        chart.data.datasets[0].backgroundColor = gradientFill;
      }
      
      chart.update();
    }
  }, [gradient]);

  return (
    <div style={{ height: `${height}px` }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default LineChart;