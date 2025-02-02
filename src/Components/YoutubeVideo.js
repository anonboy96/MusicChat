import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { db } from '../firebase-config';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { useStateContext } from '../Context/ContextProvider';
import { HiMusicalNote } from 'react-icons/hi2';

const YouTubeVideo = ({ videoIds }) => {
  const intervalRef = useRef(null);
  const [id, setId] = useState('');
  const {
    setOnReady, setTitle, setArtist, setVideoIds, currentPlaying,
    setCurrentPlaying, setDuration, setCurrentTime, isSeeking,
    setIsSeeking, onReady, setPlayedBy
  } = useStateContext();

  useEffect(() => {
    const syncPlayback = async () => {
      const docRef = doc(db, 'room', sessionStorage.getItem('roomCode'));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoIds(data.currentSong);
        if (data.currentPlaying) {
          setCurrentPlaying(data.currentPlaying);
          setId(data.currentPlaying.id);
          setTitle(data.currentPlaying.title);
          setArtist(data.currentPlaying.channelName);
          setPlayedBy(data.currentPlaying.playedBy);

          if (onReady) {
            const serverTime = data.currentPlaying.currentTime || 0;
            const localTime = onReady.getCurrentTime();
            if (Math.abs(localTime - serverTime) > 1) {
              onReady.seekTo(serverTime, true);
            }
            onReady.playVideo();
          }
        }
      }
    };
    
    const unsubscribe = onSnapshot(doc(db, 'room', sessionStorage.getItem('roomCode')), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentPlaying) {
          setId(data.currentPlaying.id);
          setCurrentPlaying(data.currentPlaying);
        }
      }
    });
    syncPlayback();
    return () => unsubscribe();
  }, [onReady]);

  const onReadyFunc = (event) => {
    setOnReady(event.target);
    setDuration(event.target.getDuration());
    event.target.playVideo();
  };

  const onStateChange = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      startInterval();
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (onReady && !isSeeking) {
        const currentTime = onReady.getCurrentTime();
        setCurrentTime(currentTime);
        
        if (Math.floor(currentTime) % 1 === 0) { // Reduce Firestore updates to every 5 seconds
          updateDoc(doc(db, 'room', sessionStorage.getItem('roomCode')), {
            'currentPlaying.currentTime': currentTime,
          }).catch(err => console.log(err));
        }
      }
    }, 1000);
  };

  const onVideoEnd = () => {
    if (videoIds.length > 1) {
      const index = videoIds.findIndex(data => data.id === currentPlaying.id);
      const nextVideo = index < videoIds.length - 1 ? videoIds[index + 1] : videoIds[0];
      updateDoc(doc(db, 'room', sessionStorage.getItem('roomCode')), {
        currentPlaying: { ...nextVideo, currentTime: 0 }
      }).catch(err => console.log(err));
    }
  };

  const opts = {
    height: '200',
    width: '100%',
    playerVars: {
      autoplay: 1,
      fs: 0,
      rel: 0,
      showinfo: 0,
      loop: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      showRelatedVideos: 0
    },
  };

  return (
    <div>
      {id ? (
        <YouTube
          videoId={id}
          opts={opts}
          onReady={onReadyFunc}
          onStateChange={onStateChange}
          onEnd={onVideoEnd}
        />
      ) : (
        <div className='h-100 w-100 mt-3 bg-zinc-800 rounded-lg flex justify-center items-center'>
          <HiMusicalNote color='black' size={86} />
        </div>
      )}
    </div>
  );
};

export default YouTubeVideo;
