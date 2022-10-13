import { IconFullScreen } from '@www/components/Icon/IconFullScreen';
import { IconFullScreenExit } from '@www/components/Icon/IconFullScreenExit';
import * as React from 'react';
import { useEffect } from 'react';

export interface FullScreenButtonProps {
  onToggle?: (fullScreen: boolean) => void;
}

export const FullScreenButton: React.FC<FullScreenButtonProps> = (props) => {
  const [fullScreen, setFullScreen] = React.useState(false);

  const Icon = fullScreen ? IconFullScreenExit : IconFullScreen;

  const toggle = () => {
    setFullScreen(!fullScreen);
    if (props.onToggle) {
      props.onToggle(!fullScreen);
    }
  };

  useEffect(() => {
    document.body.style.overflow = fullScreen ? 'hidden' : 'auto';

    if (fullScreen) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && fullScreen) {
          toggle();
        }
      };
      document.body.addEventListener('keydown', onKeyDown);

      return () => {
        document.body.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [fullScreen]);

  return (
    <button
      onClick={toggle}
      className="text-sm text-primary dark:text-primary-dark inline-flex items-center hover:text-link duration-100 ease-in transition mx-1"
      title="FullScreen Sandpack"
      type="button"
    >
      <Icon className="inline mr-1" />{' '}
      {fullScreen ? 'Exit Full Screen' : 'Full Screen'}
    </button>
  );
};
