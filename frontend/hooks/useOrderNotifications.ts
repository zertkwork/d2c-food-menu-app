import { useEffect, useRef } from "react";

let audioContext: AudioContext | null = null;

const playNotificationSound = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);

  setTimeout(() => {
    const oscillator2 = audioContext!.createOscillator();
    const gainNode2 = audioContext!.createGain();

    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext!.destination);

    oscillator2.frequency.value = 1000;
    oscillator2.type = "sine";

    gainNode2.gain.setValueAtTime(0.3, audioContext!.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext!.currentTime + 0.3);

    oscillator2.start(audioContext!.currentTime);
    oscillator2.stop(audioContext!.currentTime + 0.3);
  }, 100);
};

export function useOrderNotifications(orderCount: number) {
  const previousCountRef = useRef<number>(orderCount);

  useEffect(() => {
    if (orderCount > previousCountRef.current) {
      playNotificationSound();
    }
    previousCountRef.current = orderCount;
  }, [orderCount]);
}
