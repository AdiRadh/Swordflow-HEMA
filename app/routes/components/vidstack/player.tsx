import '@vidstack/react/player/styles/base.css';

import { useEffect, useRef } from 'react';

import {
  MediaProviderAdapter,
  MediaProviderChangeEvent,
  MediaCanPlayDetail,
  MediaCanPlayEvent,
  MediaPlayerInstance,
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
} from '@vidstack/react';

import { VideoLayout } from '~/routes/components/vidstack/layouts/video-layout';
import { textTracks } from '~/routes/components/vidstack/tracks';

export function Player({ source }: { source: string }){
  console.log("test" +source);
  let player = useRef<MediaPlayerInstance>(null);

  const url = `https://customer-ygplonnlzoah3484.cloudflarestream.com/${source}/iframe`
  useEffect(() => {
    // Subscribe to state updates.
    return player.current!.subscribe(({ paused, viewType }) => {
      // console.log('is paused?', '->', state.paused);
      // console.log('is audio view?', '->', state.viewType === 'audio');
    });
  }, []);

  function onProviderChange(
    provider: MediaProviderAdapter | null,
    nativeEvent: MediaProviderChangeEvent,
  ) {
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.config = {};
    }
  }

  // We can listen for the `can-play` event to be notified when the player is ready.
  function onCanPlay(detail: MediaCanPlayDetail, nativeEvent: MediaCanPlayEvent) {
    // ...
  }

  return (
    <MediaPlayer
      className="w-full aspect-video bg-slate-900 text-white font-sans overflow-hidden rounded-md ring-media-focus data-[focus]:ring-4"
      title="Sprite Fight"
      src={source}
      crossOrigin
      playsInline
      onProviderChange={onProviderChange}
      onCanPlay={onCanPlay}
      ref={player}
    >
      <MediaProvider>
        <Poster
          className="absolute inset-0 block h-full w-full rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
          src="https://files.vidstack.io/sprite-fight/poster.webp"
          alt="Girl walks into campfire with gnomes surrounding her friend ready for their next meal!"
        />
        {textTracks.map((track) => (
          <Track {...track} key={track.src} />
        ))}
      </MediaProvider>

      <VideoLayout thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" />
    </MediaPlayer>
  );
}