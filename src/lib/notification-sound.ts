// Gerar um som de notificação usando Web Audio API
export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Criar oscilador (gerador de tom)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Conectar oscilador -> ganho -> destino
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar o som (tom agradável de notificação)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequência inicial
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1); // Desce

    // Envelope do volume
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    // Tocar o som
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    console.log('🔔 Notificação sonora tocada');
  } catch (error) {
    console.error('Erro ao tocar notificação:', error);
  }
};

// Verificar permissão de notificação
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Mostrar notificação do navegador
export const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/logo.png',
      badge: '/logo.png',
      tag: 'isa-support'
    } as NotificationOptions);
  }
};
