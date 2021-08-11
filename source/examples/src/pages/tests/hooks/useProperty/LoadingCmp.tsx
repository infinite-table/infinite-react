import { useProperty } from '@src/components/hooks/useProperty';
import { useState } from 'react';

export type LoadingCmpProps = {
  loading?: boolean | undefined;
  defaultLoading?: boolean | undefined;
  onLoadingChange?: (loading: boolean) => void;
};
export const LoadingCmp = (props: LoadingCmpProps) => {
  const [state, setState] = useState({
    loading: false,
  });

  const [loading, setLoading] = useProperty('loading', props, {
    fromState: () => state.loading,
    normalize: (loading?: boolean) => !!loading,
    setState: (loading: boolean | undefined) =>
      setState({ loading: !!loading }),
  });
  return (
    <div>
      value={`${loading}`}
      <button
        id="inner"
        onClick={() => {
          setLoading(!loading);
        }}
      >
        toggle
      </button>
    </div>
  );
};
