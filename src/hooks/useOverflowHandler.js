import { useEffect, useRef } from "react";

export default function useOverflowHandler(size) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientHeight } = containerRef.current;

        if (size <= clientHeight) {
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
        } else {
          document.documentElement.style.overflow = "auto";
          document.body.style.overflow = "auto";
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return containerRef;
}
