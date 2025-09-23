import { useState, useEffect, useRef } from "react";

const Counter = ({ end, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [startCounting, setStartCounting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStartCounting(true);
          observer.disconnect(); // trigger once
        }
      },
      { threshold: 0.5 } // at least 50% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!startCounting) return;

    let start = 0;
    const totalFrames = Math.round(duration / 16);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const value = Math.floor(progress * end);

      setCount(value);

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, 16);

    return () => clearInterval(counter);
  }, [startCounting, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export default Counter;
