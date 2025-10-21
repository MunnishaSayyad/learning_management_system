import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ProgressData {
  progressValue: number;
}

interface VideoPlayerProps {
  width?: string;
  height?: string;
  url: string;
  progressData?: ProgressData;
  onComplete?: () => void;
}

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onComplete,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [markedComplete, setMarkedComplete] = useState(false); // ✅ prevent repeat marking

  const playerRef = useRef<ReactPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayAndPause = () => setPlaying(prev => !prev);

  const handleProgress = (state: { played: number }) => {
    if (!seeking) setPlayed(state.played);
  };

  const handleRewind = () => {
    const currentTime = playerRef.current?.getCurrentTime() ?? 0;
    playerRef.current?.seekTo(currentTime - 5);
  };

  const handleForward = () => {
    const currentTime = playerRef.current?.getCurrentTime() ?? 0;
    playerRef.current?.seekTo(currentTime + 5);
  };

  const handleToggleMute = () => setMuted(prev => !prev);

  const handleSeekChange = (newValue: number[]) => {
    setPlayed(newValue[0] / 100);
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  };

  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0] / 100);
  };

  const formatTime = (seconds: number) => {
    const pad = (num: number) => ("0" + num).slice(-2);
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());
    return hh ? `${hh}:${pad(mm)}:${ss}` : `${mm}:${ss}`;
  };

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      playerContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullScreen]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // ✅ Trigger onComplete() if watched >= 90%
  useEffect(() => {
    if (played >= 0.9 && !markedComplete) {
      onComplete?.();
      setMarkedComplete(true);
    }
  }, [played, markedComplete, onComplete]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${isFullScreen ? "w-screen h-screen" : ""
        }`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <ReactPlayer
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onEnded={() => {
          onComplete?.();
          setMarkedComplete(true); // ✅ fallback if video ends
        }}
      />

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-4 transition-opacity duration-300">
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={handleSeekChange}
            onValueCommit={handleSeekMouseUp}
            className="w-full mb-4 h-2 [&>*]:bg-white [&>.slider-track]:bg-gray-600 [&>.slider-thumb]:bg-blue-500"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button type="button" onClick={handlePlayAndPause} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button type="button" onClick={handleRewind} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button type="button" onClick={handleForward} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                <RotateCw className="h-6 w-6" />
              </Button>
              <Button type="button" onClick={handleToggleMute} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24 h-1 [&>*]:bg-white [&>.slider-thumb]:bg-blue-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-white">
                {formatTime(played * (playerRef.current?.getDuration() || 0))} /{" "}
                {formatTime(playerRef.current?.getDuration() || 0)}
              </div>
              <Button type="button" onClick={handleFullScreen} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                {isFullScreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
