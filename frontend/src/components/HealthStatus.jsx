import { useState, useEffect } from 'react';
import { getHealth } from '../services/api';

function HealthStatus() {
  const [status, setStatus] = useState({ ollama: false, kiwix: false, backend: true });

  useEffect(() => {
    const checkHealth = async () => {
      const health = await getHealth();
      setStatus(health);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getLightColor = () => {
    if (status.backend === false) return 'red';
    if (status.ollama && status.kiwix) return 'green';
    if (status.ollama) return 'yellow';
    return 'red';
  };

  const statusConfig = {
    green: { class: 'bg-green-500', text: 'Ollama + Kiwix Ready', pulse: true },
    yellow: { class: 'bg-yellow-500', text: 'Limited to General Knowledge', pulse: false },
    red: { class: 'bg-red-500', text: 'Services unavailable', pulse: false },
  };

  const lightColor = getLightColor();
  const config = statusConfig[lightColor];

  return (
    <div className="flex items-center gap-2 text-xs" title={config.text}>
      <div className={`w-2.5 h-2.5 rounded-full ${config.class} ${config.pulse ? 'pulse-active' : ''}`} />
      <span className="text-gray-600 dark:text-gray-400 font-medium">{config.text}</span>
    </div>
  );
}

export default HealthStatus;
