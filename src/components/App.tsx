import React, { memo, useCallback, useEffect } from 'react';
import { Gain } from 'tone';
import toNumber from 'lodash/toNumber';
import RangeInput from './RangeInput';
import Track from './Track';
import { setGlobalParam, setPlay, updateAllParams } from '../reducers/params';
import { setGlobalAudioComponent } from '../reducers/audio';
import { useAppSelector, useAppDispatch } from '../hooks';
import { selectGlobalAudio, selectGlobalParams, selectTracksParams } from '../selectors';
import { getParamsFromUrl, isTracksStateType, updateUrlQuery } from '../helpers';
import '../styles/index.scss';

const App = memo(() => {
  const trackId = 0;
  const dispatch = useAppDispatch();
  const globalParams = useAppSelector(selectGlobalParams);
  const globalAudio = useAppSelector(selectGlobalAudio);
  const tracksState = useAppSelector(selectTracksParams);
  const { playing, volume } = globalParams;
  const { outputNode } = globalAudio;

  const tracksIds = Object.keys(tracksState).map((id) => toNumber(id));

  // init component
  useEffect(() => {
    const outputNode = new Gain(volume).toDestination();
    dispatch(setGlobalAudioComponent('outputNode', outputNode));
  }, []);

  // update params state from url query
  useEffect(() => {
    const value = getParamsFromUrl();
    if (!isTracksStateType(value)) {
      console.error("Prevented state update because the url query params structure differs from the app's state one");
    } else {
      dispatch(updateAllParams({ value }));
    }
  }, []);

  // update url query on params change
  useEffect(() => {
    updateUrlQuery(tracksState);
  }, [tracksState]);

  const togglePlay = useCallback(() => {
    if (!playing) {
      dispatch(setPlay(true));
    } else {
      dispatch(setPlay(false));
    }
  }, [playing, dispatch]);

  // Change master volume
  useEffect(() => {
    if (outputNode) {
      outputNode.set({ gain: volume });
    } else {
      console.error('master volume is null');
    }
  }, [outputNode, volume]);

  const handleChangeGlobalParam = (value: number) => {
    dispatch(setGlobalParam('volume', value));
  };

  return (
    <div className='content'>
      <div id='main-controls'>
        <button id='play-button' className='btn btn-dark' onClick={togglePlay}>
          {playing ? 'Stop' : 'Start'}
        </button>
        <div id='volume'>
          <RangeInput label='' min={0} max={1} step={0.1} unit='' value={volume} onChange={handleChangeGlobalParam} />
        </div>
      </div>
      {tracksIds.map((id) => (
        <Track trackId={id} />
      ))}
    </div>
  );
});

export default App;

// find why to do this...?
// const latestTrackParams = useRef(trackParams);
// useEffect(() => {
//   latestTrackParams.current = trackParams;
// }, [trackParams]);

// window.addEventListener('keydown', (e: KeyboardEvent) => {
//   if (e.key === ' ') {
//     togglePlay();
//   }
// });
