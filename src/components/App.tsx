import React, { memo, useCallback, useEffect, useState } from 'react';
import { Gain } from 'tone';
import toNumber from 'lodash/toNumber';
import RangeInput from './shared/RangeInput';
import Track from './Track';
import { addTrack, setGlobalParam, setPlay, updateAllParams } from '../reducers/params';
import { addTrack as addTrackAudio, setGlobalAudioComponent } from '../reducers/audio';
import { useAppSelector, useAppDispatch } from '../hooks';
import { selectGlobalAudio, selectGlobalParams, selectTracksParams } from '../selectors';
import { getParamsFromUrl, isTracksStateType, updateUrlQuery } from '../helpers';
import '../styles/index.scss';
import { RiPlayFill, RiStopFill, RiAddFill } from 'react-icons/ri';
import IconButton from './shared/IconButton';
import * as Tone from 'tone';

const App = memo(() => {
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
  // ISSUE: probably does not update the entirety of the audio
  // need to create a system that creates
  useEffect(() => {
    const value = getParamsFromUrl();
    console.log(JSON.stringify(value));
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

  function handleAddTrack() {
    const id = Object.keys(tracksState).length;
    dispatch(addTrackAudio(id));
    dispatch(addTrack(id));
  }

  const [colors, setColors] = useState([
    'green',
    'blue',
    'purple',
    'pink',
    'yellow',
    'red',
    'indigo',
    'teal',
    'cyan',
    'orange',
  ]);

  function enableToneOnMobile() {
    if (Tone.context.state !== 'running') {
      Tone.context.resume();
      console.log('Tone.context.resume()');
    }
  }

  return (
    <div className='app'>
      <div id='main-controls'>
        <IconButton id='play-button' onClick={togglePlay} onMouseDown={enableToneOnMobile}>
          {playing ? <RiStopFill /> : <RiPlayFill />}
        </IconButton>
        <div id='volume'>
          <RangeInput label='' min={0} max={1} step={0.1} unit='' value={volume} onChange={handleChangeGlobalParam} />
        </div>
      </div>
      <div id='tracks-view'>
        {tracksIds.map((id) => (
          <Track key={id} trackId={id} color={colors[id]} />
        ))}
        <div className='d-flex justify-content-center align-items-center'>
          <IconButton id='add-track-btn' className='my-3' variant='filled' onClick={handleAddTrack}>
            <RiAddFill />
          </IconButton>
        </div>
      </div>
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
