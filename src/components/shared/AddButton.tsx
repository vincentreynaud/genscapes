import React, { ChangeEvent } from 'react';
import { EFFECT_IDS, EFFECT_NAMES_MAP } from '../../lib/constants';
import ModuleWrapper from './ModuleWrapper';

type State = {
  onAdd: (effect: any) => void;
};

const AddButton = ({ onAdd }: State) => {
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onAdd(e.target.value);
  };

  return (
    <ModuleWrapper id='add-effect-button' title=''>
      <select name='effect-name' id='effect-select' onChange={handleSelectChange}>
        <option value=''>Add effect...</option>
        {EFFECT_IDS.map((id) => (
          <option key={id} value={id} id={`${id}-select-option`}>
            {EFFECT_NAMES_MAP[id]}
          </option>
        ))}
      </select>
    </ModuleWrapper>
  );
};

export default AddButton;
