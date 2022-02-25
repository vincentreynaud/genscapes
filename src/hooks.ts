import { filter, isEqual } from 'lodash';
import { useEffect, useRef } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { getParamsFromUrl, isTracksStateType } from './helpers';
import { updateAllParams } from './reducers/params';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePrevious = (value, initialValue) => {
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useEffectDebugger = (effectHook: () => void, deps: any[], depNames: string[] = []) => {
  const previousDeps = usePrevious(deps, []);
  const changedDeps = deps.reduce((acc, dep, i) => {
    if (!isEqual(dep, previousDeps[i])) {
      return {
        ...acc,
        [depNames[i] || i]: dep,
      };
    }

    return acc;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log('[use-effect-debugger] ', changedDeps);
  }

  useEffect(effectHook, deps);
};

export const useWhatChanged = (deps: any[]) => {
  const previousDeps = usePrevious(deps, []);
  const changedDeps = deps.map((dep, i) => {
    if (!isEqual(dep, previousDeps[i])) {
      return dep;
    }
  });

  const filtered = filter(changedDeps, (dep) => dep !== undefined);
  return filtered;
};

// export const useUpdateStateFromUrl = (dispatch, deps: any[]) => {
//   const value = getParamsFromUrl();
//   if (!isTracksStateType(value)) {
//     console.error("Prevented state update because the url query params structure differs from the app's state one");
//   } else {
//     // update tone audio
//     dispatch(updateAllParams({ value }));
//   }
// };
