import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const ParallaxImage = ({ src, alt, strength = 120 }) => {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Disable parallax if user prefers reduced motion
  const y = reduceMotion
    ? 0
    : useTransform(scrollY, [0, 600], [0, -strength]);

  return (
    <motion.img
      src={src}
      alt={alt}
      loading="lazy"
      style={{
        y,
        width: "100%",
        borderRadius: "16px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        willChange: "transform",
      }}
    />
  );
};

export default ParallaxImage;
