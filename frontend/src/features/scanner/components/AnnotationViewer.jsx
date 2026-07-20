import { useRef, useEffect } from "react";

export default function AnnotationViewer({ imageUrl, annotations }) {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!imageUrl || !image || !canvas) {
      return;
    }

    const resizeCanvas = () => {
      canvas.width = image.clientWidth;
      canvas.height = image.clientHeight;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Note: If you start using custom paper sizes, you can pass these as props!
      const PDF_WIDTH = 595;
      const PDF_HEIGHT = 842;

      const scaleX = image.clientWidth / PDF_WIDTH;
      const scaleY = image.clientHeight / PDF_HEIGHT;

      (annotations ?? []).forEach((annotation) => {
        // Draw Green Ring (Correct Answer)
        if (annotation.correct) {
          const { x, y, r } = annotation.correct;
          ctx.beginPath();
          ctx.arc(
            x * scaleX,
            y * scaleY,
            r * Math.min(scaleX, scaleY),
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = "rgba(34, 197, 94, 0.9)"; // Tailwind green-500
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Draw Red Ring (Wrong Answer)
        if (annotation.wrong) {
          const { x, y, r } = annotation.wrong;
          ctx.beginPath();
          ctx.arc(
            x * scaleX,
            y * scaleY,
            r * Math.min(scaleX, scaleY),
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = "rgba(239, 68, 68, 0.9)"; // Tailwind red-500
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      });
    };

    if (image.complete) {
      resizeCanvas();
    } else {
      image.onload = resizeCanvas;
    }

    // Also resize if the user adjusts their browser window
    window.addEventListener("resize", resizeCanvas);

    return () => {
      image.onload = null;
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [imageUrl, annotations]);

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="relative inline-block w-full max-w-2xl">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Graded Paper Analysis"
          className="block w-full h-auto rounded"
        />

        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
        />
      </div>
    </div>
  );
}
