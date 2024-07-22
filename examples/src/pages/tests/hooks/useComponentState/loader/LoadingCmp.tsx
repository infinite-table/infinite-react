import {
  buildManagedComponent,
  useManagedComponentState,
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
    useManagedComponentState<LoadingCmpState>();

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

const { ManagedComponentContextProvider: LoadingRoot } = buildManagedComponent({
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
