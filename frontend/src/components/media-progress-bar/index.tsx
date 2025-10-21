import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  isMediaUploading: boolean;
  progress: number;
};

function MediaProgressbar({ isMediaUploading, progress }: Props) {
  const [showProgress, setShowProgress] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (isMediaUploading) {
      setShowProgress(true);
      setAnimatedProgress(progress);
    } else {
      const timer = setTimeout(() => {
        setShowProgress(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMediaUploading, progress]);

  if (!showProgress) return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mt-5 mb-5 relative overflow-hidden">
      <motion.div
        className="bg-blue-600 h-3 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${animatedProgress}%` }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Looping shimmer when progress reaches 100 */}
        {progress >= 100 && isMediaUploading && (
          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 bg-blue-400 opacity-50"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

export default MediaProgressbar;
