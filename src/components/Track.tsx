import react from 'react';
import { TrackState } from '../types/params';

type Props = {
  params: TrackState;
  trackId: number;
};
export default function Track({ params, trackId }: Props) {
  const { signalChain, composition } = params;
  return (
    <div id={`track-${trackId}`} className='container-fluid'>
      <div className='row'>
        <div className='col'></div>
      </div>
    </div>
  );
}
