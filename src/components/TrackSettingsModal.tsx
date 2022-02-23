import { VscSettings } from '@react-icons/all-files/vsc/VscSettings.esm';
import { Modal } from 'reactstrap';
import TrackSettings from './TrackSettings';
import { UpdateModuleParamHelper, UpdateTrackParamHelper } from '../types/params';
import { useState } from 'react';
import IconButton from './shared/IconButton';
import { IoMdClose } from '@react-icons/all-files/io/IoMdClose.esm';

type Props = {
  trackId: number;
  onTrackParamChange: UpdateTrackParamHelper;
  onModuleParamChange: UpdateModuleParamHelper;
  onAddEffect: any;
  onDeleteEffect: any;
  setCurrentScale: any;
};

export default function TrackSettingsModal({
  trackId,
  onDeleteEffect,
  onAddEffect,
  onTrackParamChange,
  onModuleParamChange,
  setCurrentScale,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setIsModalOpen(true)}>
        <VscSettings />
      </IconButton>
      <Modal
        toggle={() => setIsModalOpen(!isModalOpen)}
        isOpen={isModalOpen}
        centered
        fade={false}
        className='position-relative'
      >
        <div className='btn-close-modal'>
          <IconButton onClick={() => setIsModalOpen(false)}>
            <IoMdClose />
          </IconButton>
        </div>
        <TrackSettings
          trackId={trackId}
          setCurrentScale={setCurrentScale}
          onTrackParamChange={onTrackParamChange}
          onModuleParamChange={onModuleParamChange}
          onAddEffect={onAddEffect}
          onDeleteEffect={onDeleteEffect}
        />
      </Modal>
    </>
  );
}
