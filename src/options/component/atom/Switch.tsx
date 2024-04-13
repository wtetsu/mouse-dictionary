/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

type Props = {
  visible: boolean;
  children?: React.ReactNode;
};

export const Switch: React.FC<Props> = (props) => {
  if (!props.visible) {
    return <></>;
  }
  return <>{props.children}</>;
};
