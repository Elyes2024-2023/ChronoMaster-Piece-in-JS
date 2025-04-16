import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const ClockFace = ({ time }) => {
  const secondHandRef = useRef(null);
  const minuteHandRef = useRef(null);
  const hourHandRef = useRef(null);

  useEffect(() => {
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondDegrees = ((seconds / 60) * 360) + 90;
    const minuteDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
    const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;

    gsap.to(secondHandRef.current, {
      rotation: secondDegrees,
      duration: 0.5,
      ease: "power2.out"
    });

    gsap.to(minuteHandRef.current, {
      rotation: minuteDegrees,
      duration: 0.5,
      ease: "power2.out"
    });

    gsap.to(hourHandRef.current, {
      rotation: hourDegrees,
      duration: 0.5,
      ease: "power2.out"
    });
  }, [time]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-96 h-96"
      data-testid="clock-face"
    >
      <div className="absolute inset-0 rounded-full border-8 border-white/20 bg-black/40 backdrop-blur-lg shadow-xl">
        {/* Clock markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            data-testid="clock-marker"
            className="absolute w-1 h-4 bg-white/80"
            style={{
              left: '50%',
              top: '10%',
              transform: `rotate(${i * 30}deg) translateX(-50%)`,
              transformOrigin: 'bottom center'
            }}
          />
        ))}

        {/* Clock hands */}
        <div
          ref={hourHandRef}
          data-testid="hour-hand"
          className="absolute w-2 h-24 bg-white rounded-full origin-bottom"
          style={{
            left: 'calc(50% - 4px)',
            bottom: '50%',
            transform: 'rotate(90deg)'
          }}
        />
        <div
          ref={minuteHandRef}
          data-testid="minute-hand"
          className="absolute w-1.5 h-32 bg-white/90 rounded-full origin-bottom"
          style={{
            left: 'calc(50% - 3px)',
            bottom: '50%',
            transform: 'rotate(90deg)'
          }}
        />
        <div
          ref={secondHandRef}
          data-testid="second-hand"
          className="absolute w-1 h-36 bg-red-500 rounded-full origin-bottom"
          style={{
            left: 'calc(50% - 2px)',
            bottom: '50%',
            transform: 'rotate(90deg)'
          }}
        />

        {/* Center dot */}
        <div
          data-testid="center-dot"
          className="absolute w-4 h-4 bg-white rounded-full"
          style={{ left: 'calc(50% - 8px)', top: 'calc(50% - 8px)' }}
        />
      </div>
    </motion.div>
  );
};

export default ClockFace; 