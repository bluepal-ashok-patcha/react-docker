// import React, { useEffect, useRef, useState } from 'react';

// // Utility to extract videoId from URL
// const extractVideoId = (url) => {
//   const regExp = /^.*(?:youtu.be\/|v=|\/v\/|embed\/|watch\?v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[1].length === 11 ? match[1] : null;
// };

// const YouTubeTracker = ({ videoUrl }) => {
//   const videoId = extractVideoId(videoUrl);
//   const playerRef = useRef(null);
//   const intervalRef = useRef(null);
//   const [videoDuration, setVideoDuration] = useState(0);
//   const [watchTime, setWatchTime] = useState(0);
//   const [completed, setCompleted] = useState(false);
//   const [percentWatched, setPercentWatched] = useState(0);

//   useEffect(() => {
//     if (!videoId) return;

//     const tag = document.createElement('script');
//     tag.src = "https://www.youtube.com/iframe_api";
//     document.body.appendChild(tag);

//     window.onYouTubeIframeAPIReady = () => {
//       playerRef.current = new window.YT.Player('yt-player', {
//         videoId,
//         events: {
//           onReady: onPlayerReady,
//           onStateChange: onPlayerStateChange,
//         },
//       });
//     };

//     return () => {
//       clearInterval(intervalRef.current);
//     };
//   }, [videoId]);

//   const onPlayerReady = (event) => {
//     setVideoDuration(event.target.getDuration());
//   };

//   const onPlayerStateChange = (event) => {
//     const player = event.target;

//     if (event.data === window.YT.PlayerState.PLAYING) {
//       intervalRef.current = setInterval(() => {
//         const currentTime = player.getCurrentTime();
//         setWatchTime((prev) => {
//           const newTime = Math.max(prev, currentTime);
//           const percent = (newTime / player.getDuration()) * 100;
//           setPercentWatched(percent);
//           checkIfCompleted(newTime, player.getDuration());
//           return newTime;
//         });
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
//     <div style={{ maxWidth: '640px', margin: 'auto', padding: '20px' }}>
//       <h2>YouTube Video Tracker</h2>

//       {!videoId ? (
//         <p style={{ color: 'red' }}>❌ Invalid YouTube URL</p>
//       ) : (
//         <>
//           <div id="yt-player" style={{ width: '100%', height: '360px' }}></div>
//           <div style={{ marginTop: '20px' }}>
//             <p><strong>Watch Time:</strong> {watchTime.toFixed(1)}s / {videoDuration.toFixed(1)}s</p>
//             <p><strong>Watched:</strong> {percentWatched.toFixed(1)}%</p>
//             <p><strong>Status:</strong> {completed ? "✅ Completed (90%+ watched)" : "⏳ In Progress"}</p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default YouTubeTracker;


import React, { useEffect, useRef, useState } from 'react';

const extractVideoId = (url) => {
  const regExp = /^.*(?:youtu.be\/|v=|\/v\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
};

const YouTubeTracker = ({ videoUrl }) => {
  const videoId = extractVideoId(videoUrl);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [videoDuration, setVideoDuration] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [percentWatched, setPercentWatched] = useState(0);

  const lastAllowedTimeRef = useRef(0);

  useEffect(() => {
    if (!videoId) return;

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [videoId]);

  const onPlayerReady = (event) => {
    setVideoDuration(event.target.getDuration());
  };

  const onPlayerStateChange = (event) => {
    const player = event.target;

    if (event.data === window.YT.PlayerState.PLAYING) {
      intervalRef.current = setInterval(() => {
        if (!player) return;

        const tolerance = 0.3; // seconds to avoid jitter
        const currentTime = player.getCurrentTime();

        // Enforce playback speed between 1x and 2x
        const rate = player.getPlaybackRate();
        if (rate < 1.0 || rate > 2.0) {
          player.setPlaybackRate(1.0);
        }

        // Prevent forward skip > 2 seconds
        if (currentTime > lastAllowedTimeRef.current + 2) {
          player.seekTo(lastAllowedTimeRef.current);
        } else {
          if (currentTime >= lastAllowedTimeRef.current - tolerance) {
            lastAllowedTimeRef.current = currentTime;
          }

          // Only update watch time if currentTime is <= lastAllowedTime + tolerance
          setWatchTime((prev) => {
            if (currentTime <= lastAllowedTimeRef.current + tolerance) {
              const newTime = Math.max(prev, currentTime);
              const percent = (newTime / player.getDuration()) * 100;
              setPercentWatched(percent);
              checkIfCompleted(newTime, player.getDuration());
              return newTime;
            }
            return prev;
          });
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);

      if (event.data === window.YT.PlayerState.ENDED) {
        checkIfCompleted(player.getDuration(), player.getDuration(), true);
      }
    }
  };

  const checkIfCompleted = (currentTime, duration, ended = false) => {
    const percent = (currentTime / duration) * 100;
    if ((percent >= 90 || ended) && !completed) {
      setCompleted(true);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: 'auto', padding: '20px' }}>
      <h2>YouTube Video Tracker</h2>

      {!videoId ? (
        <p style={{ color: 'red' }}>❌ Invalid YouTube URL</p>
      ) : (
        <>
          <div id="yt-player" style={{ width: '100%', height: '360px' }}></div>

          <div style={{ marginTop: '20px' }}>
            <p><strong>Watch Time:</strong> {watchTime.toFixed(1)}s / {videoDuration.toFixed(1)}s</p>
            <p><strong>Watched:</strong> {percentWatched.toFixed(1)}%</p>
            <p><strong>Status:</strong> {completed ? "✅ Completed (90%+ watched)" : "⏳ In Progress"}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default YouTubeTracker;
