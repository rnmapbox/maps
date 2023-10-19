import PropTypes from 'prop-types';

import type { ItemProps } from '../../scenes/GroupAndItem';

const BaseExamplePropTypes = {
  label: PropTypes.string.isRequired,
  onDismissExample: PropTypes.func.isRequired,
};

export type BaseExampleProps = {
  label: string;
  onDismissExample: () => void;
  navigation: ItemProps['navigation'];
};

export default BaseExamplePropTypes;
