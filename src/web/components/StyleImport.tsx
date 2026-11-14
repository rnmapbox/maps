import { memo, useContext, useEffect, useRef } from 'react';

import MapContext from '../MapContext';

type Props = {
  id: string;
  existing: boolean;
  config: { [key: string]: unknown };
};

function StyleImport({ id, config }: Props) {
  const { map, styleGeneration = 0 } = useContext(MapContext);
  const applied = useRef<{ generation: number; config: Props['config'] }>({
    generation: 0,
    config: {},
  });

  useEffect(() => {
    if (!map || styleGeneration === 0) {
      return;
    }
    const previous =
      applied.current.generation === styleGeneration
        ? applied.current.config
        : {};
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined && previous[key] !== value) {
        map.setConfigProperty(id, key, value);
      }
    }
    applied.current = { generation: styleGeneration, config };
  });

  return null;
}

export default memo(StyleImport);
