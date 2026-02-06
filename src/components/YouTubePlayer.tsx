import { useState, useRef } from 'react';
import ReactPlayer from 'react-player'; // Use the specific YouTube player

const YouTubePlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const playerRef: any = useRef(null);

  const handlePlayPause = () => setPlaying(!playing);

  const handleSeekChange = (e: any) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    playerRef?.current?.seekTo(newPlayed);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '240px',
      backgroundColor: '#000',
      borderRadius: '24px',
      overflow: 'hidden'
    }}>
      {/* 1. THE VIDEO LAYER */}
      <ReactPlayer
        ref={playerRef}
        src="https://youtu.be/aGHCyzVqfrQ?si=4b9LIXM1Jft2srD-"
        playing={playing}
        controls={false} // Hides default YouTube UI
        width="100%"
        height="100%"
        onProgress={(state: any) => setPlayed(state.played)}
      />

      {/* 2. THE CUSTOM UI LAYER (Placed over the video) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>

        {/* Seek Bar */}
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={played}
          onChange={handleSeekChange}
          style={{ width: '100%', cursor: 'pointer', accentColor: 'red' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Play Button */}
          <button
            onClick={handlePlayPause}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            {playing ? '⏸️ Pause' : '▶️ Play'}
          </button>

          {/* Time Display */}
          <span style={{ color: 'white', fontSize: '14px', fontFamily: 'sans-serif' }}>
            {Math.round(played * 100)}% Played
          </span>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;