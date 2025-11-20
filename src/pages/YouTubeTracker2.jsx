// import React, { useEffect, useRef, useState } from "react";

// // Extract videoId from URL
// const extractVideoId = (url) => {
//   const regExp = /^.*(?:youtu.be\/|v=|\/v\/|embed\/|watch\?v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[1].length === 11 ? match[1] : null;
// };

// const YouTubeTracker2 = ({ videoUrl }) => {
//   const videoId = extractVideoId(videoUrl);
//   const playerRef = useRef(null);
//   const intervalRef = useRef(null);

//   const [videoDuration, setVideoDuration] = useState(0);
//   const [watchTime, setWatchTime] = useState(0);
//   const [completed, setCompleted] = useState(false);
//   const [percentWatched, setPercentWatched] = useState(0);

//   const lastAllowedTimeRef = useRef(0);

//   useEffect(() => {
//     if (!videoId) return;

//     // Clean up old player if exists
//     if (playerRef.current) {
//       playerRef.current.destroy();
//       playerRef.current = null;
//     }

//     // Load YouTube API script only once
//     if (!window.YT) {
//       const tag = document.createElement("script");
//       tag.src = "https://www.youtube.com/iframe_api";
//       document.body.appendChild(tag);
//     }

//     // Wait for API ready then create player
//     const onAPIReady = () => {
//     //   playerRef.current = new window.YT.Player("yt-player", {
//     //     videoId,
//     //     events: {
//     //       onReady: onPlayerReady,
//     //       onStateChange: onPlayerStateChange,
//     //     },
//     //     playerVars: {
//     //       controls: 1,
//     //       modestbranding: 1,
//     //     },
//     //   });

//     playerRef.current = new window.YT.Player("yt-player", {
//   videoId,
//   playerVars: {
//     rel: 0,
//     modestbranding: 1,
//     controls: 1,
//     fs: 0,
//     disablekb: 1,
//   },
//   events: {
//     onReady: onPlayerReady,
//     onStateChange: onPlayerStateChange,
//   },
// });

//     };

//     if (window.YT && window.YT.Player) {
//       onAPIReady();
//     } else {
//       window.onYouTubeIframeAPIReady = onAPIReady;
//     }

//     // Reset state on new video load
//     setWatchTime(0);
//     setCompleted(false);
//     setPercentWatched(0);
//     lastAllowedTimeRef.current = 0;

//     return () => {
//       clearInterval(intervalRef.current);
//       if (playerRef.current) {
//         playerRef.current.destroy();
//         playerRef.current = null;
//       }
//     };
//   }, [videoId]);

//   const onPlayerReady = (event) => {
//     setVideoDuration(event.target.getDuration());
//   };

//   const onPlayerStateChange = (event) => {
//     const player = event.target;

//     if (event.data === window.YT.PlayerState.PLAYING) {
//       intervalRef.current = setInterval(() => {
//         if (!player) return;

//         const tolerance = 0.3;
//         const currentTime = player.getCurrentTime();

//         // Enforce playback speed 1x-2x
//         const rate = player.getPlaybackRate();
//         if (rate < 1.0 || rate > 2.0) {
//           player.setPlaybackRate(1.0);
//         }

//         // Prevent forward skipping > 2s
//         if (currentTime > lastAllowedTimeRef.current + 2) {
//           player.seekTo(lastAllowedTimeRef.current);
//         } else {
//           if (currentTime >= lastAllowedTimeRef.current - tolerance) {
//             lastAllowedTimeRef.current = currentTime;
//           }

//           setWatchTime((prev) => {
//             if (currentTime <= lastAllowedTimeRef.current + tolerance) {
//               const newTime = Math.max(prev, currentTime);
//               const percent = (newTime / player.getDuration()) * 100;
//               setPercentWatched(percent);
//               checkIfCompleted(newTime, player.getDuration());
//               return newTime;
//             }
//             return prev;
//           });
//         }
//       }, 1000);
//     } else {
//       clearInterval(intervalRef.current);

//       if (event.data === window.YT.PlayerState.ENDED) {
//         checkIfCompleted(player.getDuration(), player.getDuration(), true);
//       }
//     }
//   };

//   const checkIfCompleted = (currentTime, duration, ended = false) => {
//     const percent = (currentTime / duration) * 100;
//     if ((percent >= 90 || ended) && !completed) {
//       setCompleted(true);
//     }
//   };

//   return (
//     <div className="tracker-container">
//       {!videoId ? (
//         <p className="error-text">❌ Invalid YouTube URL</p>
//       ) : (
//         <>
//           <div id="yt-player" className="yt-player"></div>

//           <div className="status-container">
//             <p>
//               <strong>Watch Time:</strong> {watchTime.toFixed(1)}s /{" "}
//               {videoDuration.toFixed(1)}s
//             </p>
//             <p>
//               <strong>Watched:</strong> {percentWatched.toFixed(1)}%
//             </p>
//             <p>
//               <strong>Status:</strong>{" "}
//               {completed ? "✅ Completed (90%+ watched)" : "⏳ In Progress"}
//             </p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default function App() {
//   // Some default videos
//   const defaultVideos = [
//     {
//       id: 1,
//       url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
//       title: "Rick Astley - Never Gonna Give You Up",
//     },
//     {
//       id: 2,
//       url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
//       title: "Queen – Bohemian Rhapsody",
//     },
//     {
//       id: 3,
//       url: "https://youtu.be/9bZkp7q19f0",
//       title: "PSY - Gangnam Style",
//     },
//   ];

//   const [videoList, setVideoList] = useState(defaultVideos);
//   const [currentVideoUrl, setCurrentVideoUrl] = useState(defaultVideos[0].url);
//   const [newUrl, setNewUrl] = useState("");

//   const handleAddVideo = () => {
//     if (!newUrl.trim()) return;

//     const id = videoList.length ? videoList[videoList.length - 1].id + 1 : 1;
//     setVideoList([
//       ...videoList,
//       { id, url: newUrl.trim(), title: `User Video ${id}` },
//     ]);
//     setCurrentVideoUrl(newUrl.trim());
//     setNewUrl("");
//   };

//   return (
//     <>
//       <style>{`
//         * {
//           box-sizing: border-box;
//         }
//         body {
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           background: #f5f7fa;
//           margin: 0;
//           padding: 20px;
//           color: #333;
//         }
//         .app-container {
//           max-width: 900px;
//           margin: 0 auto;
//           background: white;
//           padding: 20px;
//           border-radius: 8px;
//           box-shadow: 0 3px 10px rgb(0 0 0 / 0.1);
//         }
//         h1 {
//           text-align: center;
//           margin-bottom: 24px;
//         }
//         .video-list {
//           margin-bottom: 20px;
//           display: flex;
//           flex-wrap: wrap;
//           gap: 10px;
//         }
//         .video-item {
//           padding: 10px 15px;
//           background: #e1e7f0;
//           border-radius: 5px;
//           cursor: pointer;
//           user-select: none;
//           flex: 1 1 30%;
//           text-align: center;
//           transition: background-color 0.2s;
//         }
//         .video-item.selected {
//           background: #4f7fff;
//           color: white;
//           font-weight: bold;
//         }
//         .video-item:hover {
//           background: #a1b9ff;
//         }
//         .input-group {
//           display: flex;
//           gap: 10px;
//           margin-bottom: 30px;
//         }
//         input[type="text"] {
//           flex-grow: 1;
//           padding: 10px 12px;
//           font-size: 16px;
//           border: 2px solid #4f7fff;
//           border-radius: 6px;
//           transition: border-color 0.3s;
//         }
//         input[type="text"]:focus {
//           outline: none;
//           border-color: #3461ff;
//           box-shadow: 0 0 5px #3461ffaa;
//         }
//         button {
//           background-color: #4f7fff;
//           border: none;
//           color: white;
//           font-weight: bold;
//           padding: 10px 18px;
//           border-radius: 6px;
//           cursor: pointer;
//           transition: background-color 0.3s;
//           user-select: none;
//         }
//         button:hover {
//           background-color: #3461ff;
//         }
//         .tracker-container {
//           border: 1px solid #ddd;
//           padding: 20px;
//           border-radius: 8px;
//           background-color: #fafafa;
//         }
//         .yt-player iframe {
//           width: 100% !important;
//           height: 360px !important;
//           border-radius: 8px;
//         }
//         .status-container {
//           margin-top: 15px;
//           font-size: 16px;
//           line-height: 1.4;
//         }
//         .error-text {
//           color: #d9534f;
//           font-weight: bold;
//           text-align: center;
//         }
//       `}</style>

//       <div className="app-container">
//         <h1>YouTube Video Tracker</h1>

//         <div className="video-list">
//           {videoList.map(({ id, url, title }) => (
//             <div
//               key={id}
//               className={`video-item ${
//                 currentVideoUrl === url ? "selected" : ""
//               }`}
//               onClick={() => setCurrentVideoUrl(url)}
//               title={title}
//             >
//               {title}
//             </div>
//           ))}
//         </div>

//         <div className="input-group">
//           <input
//             type="text"
//             placeholder="Enter YouTube video URL"
//             value={newUrl}
//             onChange={(e) => setNewUrl(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 handleAddVideo();
//               }
//             }}
//           />
//           <button onClick={handleAddVideo}>Add Video</button>
//         </div>

//         <YouTubeTracker2 videoUrl={currentVideoUrl} />
//       </div>
//     </>
//   );
// }



import React, { useEffect, useRef, useState } from "react";

const extractVideoId = (url) => {
  const regExp = /^.*(?:youtu.be\/|v=|\/v\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const YouTubeTracker = ({ videoUrl }) => {
  const videoId = extractVideoId(videoUrl);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [percentWatched, setPercentWatched] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const lastAllowedTimeRef = useRef(0);
  const seekingRef = useRef(false);

  useEffect(() => {
    if (!videoId) return;

    // Destroy old player if exists
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Load YouTube API script only once
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const onAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: {
          controls: 0, // Hide native controls
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3, // Hide video annotations
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onAPIReady;
    }

    setWatchTime(0);
    setCompleted(false);
    setPercentWatched(0);
    setCurrentTime(0);
    lastAllowedTimeRef.current = 0;
    setPlaying(false);
    setPlaybackRate(1);

    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const onPlayerReady = (event) => {
    setVideoDuration(event.target.getDuration());
  };

  const onPlayerStateChange = (event) => {
    const player = event.target;

    if (event.data === window.YT.PlayerState.PLAYING) {
      setPlaying(true);
      intervalRef.current = setInterval(() => {
        if (!player) return;
        const tolerance = 0.3;
        const curTime = player.getCurrentTime();

        // Enforce playback speed limits
        const rate = player.getPlaybackRate();
        if (rate < 1.0 || rate > 2.0) {
          player.setPlaybackRate(playbackRate);
        }

        // Prevent skipping forward > 2s
        if (curTime > lastAllowedTimeRef.current + 2 && !seekingRef.current) {
          player.seekTo(lastAllowedTimeRef.current);
          return; // skip further updates this tick
        }

        if (curTime >= lastAllowedTimeRef.current - tolerance) {
          lastAllowedTimeRef.current = curTime;
        }

        setCurrentTime(curTime);

        setWatchTime((prev) => {
          if (curTime <= lastAllowedTimeRef.current + tolerance) {
            const newTime = Math.max(prev, curTime);
            const percent = (newTime / player.getDuration()) * 100;
            setPercentWatched(percent);
            checkIfCompleted(newTime, player.getDuration());
            return newTime;
          }
          return prev;
        });
      }, 500);
    } else {
      setPlaying(false);
      clearInterval(intervalRef.current);

      if (event.data === window.YT.PlayerState.PAUSED) {
        // do nothing special
      }

      if (event.data === window.YT.PlayerState.ENDED) {
        setCurrentTime(videoDuration);
        checkIfCompleted(videoDuration, videoDuration, true);
      }
    }
  };

  const checkIfCompleted = (curTime, duration, ended = false) => {
    const percent = (curTime / duration) * 100;
    if ((percent >= 90 || ended) && !completed) {
      setCompleted(true);
    }
  };

  // Custom controls handlers:

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const onSeekBarChange = (e) => {
    if (!playerRef.current) return;
    seekingRef.current = true;
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const onSeekBarCommit = (e) => {
    if (!playerRef.current) return;
    const val = parseFloat(e.target.value);

    // Prevent skipping forward more than 2s from last allowed watch time
    if (val > lastAllowedTimeRef.current + 2) {
      playerRef.current.seekTo(lastAllowedTimeRef.current);
      setCurrentTime(lastAllowedTimeRef.current);
    } else {
      playerRef.current.seekTo(val);
      setCurrentTime(val);
      if (val >= lastAllowedTimeRef.current - 0.3) {
        lastAllowedTimeRef.current = val;
      }
    }
    seekingRef.current = false;
  };

  const changePlaybackRate = (rate) => {
    if (!playerRef.current) return;
    if (rate < 1) rate = 1;
    if (rate > 2) rate = 2;
    setPlaybackRate(rate);
    playerRef.current.setPlaybackRate(rate);
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "auto",
        background: "#222",
        padding: 20,
        borderRadius: 10,
        color: "#eee",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {!videoId ? (
        <div
          style={{
            color: "#ff4444",
            textAlign: "center",
            fontWeight: "bold",
            padding: 20,
          }}
        >
          ❌ Invalid YouTube URL
        </div>
      ) : (
        <>
          <div
            id="yt-player"
            style={{
              width: "100%",
              height: 390,
              borderRadius: 10,
              overflow: "hidden",
              background: "black",
              marginBottom: 10,
            }}
          ></div>

          {/* Custom Controls */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              userSelect: "none",
            }}
          >
            <button
              onClick={togglePlay}
              style={{
                padding: "10px 20px",
                fontSize: 18,
                borderRadius: 5,
                cursor: "pointer",
                backgroundColor: playing ? "#e03e3e" : "#3ee052",
                border: "none",
                color: "#222",
                fontWeight: "bold",
                transition: "background-color 0.3s",
              }}
              aria-label={playing ? "Pause video" : "Play video"}
            >
              {playing ? "Pause ⏸" : "Play ▶️"}
            </button>

            <input
              type="range"
              min={0}
              max={videoDuration}
              step={0.1}
              value={currentTime}
              onChange={onSeekBarChange}
              onMouseUp={onSeekBarCommit}
              onTouchEnd={onSeekBarCommit}
              style={{ width: "100%" }}
              aria-label="Seek video"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                color: "#ccc",
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(videoDuration)}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label htmlFor="speed" style={{ minWidth: 100 }}>
                Playback Speed:
              </label>
              <select
                id="speed"
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="1.75">1.75x</option>
                <option value="2">2x</option>
              </select>
            </div>

            <div
              style={{
                marginTop: 10,
                fontWeight: "bold",
                color: completed ? "#0f0" : "#ccc",
              }}
            >
              Watch Time: {watchTime.toFixed(1)}s / {videoDuration.toFixed(1)}s{" "}
              &nbsp; | &nbsp; Watched: {percentWatched.toFixed(1)}%{" "}
              &nbsp; | &nbsp; Status:{" "}
              {completed ? "✅ Completed (90%+ watched)" : "⏳ In Progress"}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default YouTubeTracker;
