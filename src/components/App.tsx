import React, { memo, useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';
import toNumber from 'lodash/toNumber';
import RangeInput from './shared/RangeInput';
import Track from './Track';
import { addTrack, setGlobalParam, setPlay, updateAllParams } from '../reducers/params';
import {
  addTrack as addTrackAudio,
  chainTrackAudioComponent,
  deleteTrack as deleteTrackAudio,
  setGlobalAudioComponent,
} from '../reducers/audio';
import { useAppSelector, useAppDispatch } from '../hooks';
import { selectGlobalAudio, selectGlobalParams, selectTracksParams } from '../selectors';
import { getParamsFromUrl, isTracksStateType, updateUrlQuery } from '../helpers';
import '../styles/index.scss';
import { RiPlayFill, RiStopFill, RiAddFill } from 'react-icons/ri';
import IconButton from './shared/IconButton';
import { updateAudioState } from '../helpers/tone';
import { trackColors } from '../lib/constants';
import SliderInput from './shared/SliderInput';
import { PiSpeakerSimpleHighFill } from 'react-icons/pi';

const App = memo(() => {
  const dispatch = useAppDispatch();
  const globalParams = useAppSelector(selectGlobalParams);
  const globalAudio = useAppSelector(selectGlobalAudio);
  const tracksState = useAppSelector(selectTracksParams);
  const { playing, volume } = globalParams;
  const { outputNode } = globalAudio;
  const [nextTrackId, setNextTrackId] = useState(Object.keys(tracksState).length);
  const tracksIds = Object.keys(tracksState).map((id) => toNumber(id));
  const [colors, setColors] = useState(trackColors);

  const updateAudioFromUrlQuery = useCallback(
    (outputNode) => {
      const tracksParams = getParamsFromUrl();
      if (!isTracksStateType(tracksParams)) {
        console.error("Prevented state update because the url query params structure differs from the app's state one");
      } else {
        updateAudioState(tracksParams, outputNode, chainTrackAudioComponent);
        dispatch(updateAllParams({ value: tracksParams }));
      }
    },
    [dispatch, updateAllParams]
  );

  // init component
  useEffect(() => {
    const outputNode = new Tone.Gain(volume).toDestination();
    dispatch(setGlobalAudioComponent('outputNode', outputNode));
    updateAudioFromUrlQuery(outputNode);
  }, [updateAudioFromUrlQuery]);

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

  // change master volume
  useEffect(() => {
    if (outputNode) {
      outputNode.set({ gain: volume });
    } else {
      console.error('master volume is null');
    }
  }, [outputNode, volume]);

  function handleChangeGlobalParam(value: number) {
    dispatch(setGlobalParam('volume', value));
  }

  function handleAddTrack() {
    const id = nextTrackId;
    setNextTrackId(nextTrackId + 1);
    dispatch(addTrackAudio(id));
    dispatch(addTrack(id));
  }

  // WIP
  function enableToneOnMobile() {
    if (Tone.context.state !== 'running') {
      Tone.context.resume();
      // Tone.start();
      console.log('Tone.context.resume()');
    }
  }

  return (
    <div className='app'>
      <div id='github-link'>
        <a href='https://github.com/vincentreynaud/genscapes'>See Github Repository</a>
      </div>
      <div id='instructions'>
        <h1>Genscapes</h1>
        <h3 className='mb-4'>Generate soundscapes in the browser</h3>
        <p>[ ! ] This App is a Work in Progress</p>
        <p>Click on the play button to start the audio.</p>
        <p>[ ! ] Please wait a few seconds for the first notes to start, depending on their length and intervals.</p>
        <p>Click on the [ + ] button to add a new track.</p>
        <p>Adjust the settings on each track and listen to the changes.</p>
        <p>Share your compositions by copying and sending the page url.</p>
      </div>
      <div id='main-controls'>
        <IconButton id='play-button' onClick={togglePlay} onMouseDown={enableToneOnMobile}>
          {playing ? <RiStopFill /> : <RiPlayFill />}
        </IconButton>
        <div id='volume' className='d-flex row'>
          <SliderInput
            label={<PiSpeakerSimpleHighFill />}
            min={0}
            max={1}
            step={0.1}
            unit=''
            value={volume}
            onChange={handleChangeGlobalParam}
            sliderWidth='6rem'
          />
          {/* <div style={{ fontSize: '20px' }}>
            
          </div> */}
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
