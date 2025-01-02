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
    window.scrollTo(0, 0);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup function to reset overflow styles
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.documentElement.removeAttribute("style");
      document.body.removeAttribute("style");
      window.removeEventListener("resize", handleResize);
    };
  }, [size]);

  return containerRef;
}
