import {
  getComponentStateRoot,
  useComponentState,
} from '@src/components/hooks/useComponentState';

export type LoadingCmpProps = {
  loading?: boolean | undefined;
  defaultLoading?: boolean | undefined;
  onLoadingChange?: (loading: boolean) => void;
};

type LoadingCmpState = {
  loading: boolean;
};
export const LoadingBaseCmp = () => {
  const { componentState: state, componentActions: actions } =
    useComponentState<LoadingCmpState>();

  return (
    <div>
      value={`${state.loading}`}
      <button
        id="inner"
        onClick={() => {
          actions.loading = !state.loading;
        }}
      >
        toggle
      </button>
    </div>
  );
};

const LoadingRoot = getComponentStateRoot({
  forwardProps: () => {
    return {
      loading: (loading) => loading ?? false,
    };
  },
});

export const LoadingCmp = (props: LoadingCmpProps) => {
  return (
    <LoadingRoot {...props}>
      <LoadingBaseCmp />
    </LoadingRoot>
  );
};
