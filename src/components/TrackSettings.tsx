import React, { useMemo } from 'react';
import AddButton from './shared/AddButton';
import Composition from './modules/Composition';
import PolySynth from './modules/PolySynth';
import { useAppSelector } from '../hooks';
import { makeSelectParamModuleByType, makeSelectTrackParams } from '../selectors';
import { PolySynthParamsModule, UpdateModuleParamHelper, UpdateTrackParamHelper } from '../types/params';
import { mapEffectNameToUiComponent } from '../lib/constants';

type Props = {
  trackId: number;
  onTrackParamChange: UpdateTrackParamHelper;
  onModuleParamChange: UpdateModuleParamHelper;
  onAddEffect: any;
  onDeleteEffect: any;
  setCurrentScale: any;
};

export default function TrackSettings({
  trackId,
  onDeleteEffect,
  onAddEffect,
  onTrackParamChange,
  onModuleParamChange,
  setCurrentScale,
}: Props) {
  const selectEffectsParams = useMemo(() => makeSelectParamModuleByType(trackId, 'effect'), [trackId]);
  const selectSourceParams = useMemo(() => makeSelectParamModuleByType(trackId, 'source'), [trackId]);
  const selectTrackParams = useMemo(() => makeSelectTrackParams(trackId), [trackId]);
  const [sourceParams] = useAppSelector((state) => selectSourceParams(state));
  const effectsParams = useAppSelector((state) => selectEffectsParams(state));

  const trackParams = useAppSelector((state) => selectTrackParams(state));
  const { sequ: sequParams } = trackParams;

  return (
    <div className='track-settings'>
      <section className='container-fluid ps-5'>
        <div className='row'>
          <PolySynth onParamChange={onModuleParamChange} params={sourceParams as PolySynthParamsModule} />
          {effectsParams.map((effect, i) => {
            const Component = mapEffectNameToUiComponent()[effect.name];
            return <Component params={effect} onParamChange={onModuleParamChange} onDelete={onDeleteEffect} key={i} />;
          })}
          <AddButton onAdd={onAddEffect} />
        </div>
      </section>
      <section className='container-fluid ps-5'>
        <div className='row'>
          <Composition onParamChange={onTrackParamChange} params={sequParams} setCurrentScale={setCurrentScale} />
        </div>
      </section>
    </div>
  );
}
