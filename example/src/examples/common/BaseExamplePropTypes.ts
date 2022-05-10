import PropTypes from 'prop-types';

const BaseExamplePropTypes = {
  label: PropTypes.string.isRequired,
  onDismissExample: PropTypes.func.isRequired,
};

export interface BaseExampleProps {
  label: string;
  onDismissExample: () => void;
}

export default BaseExamplePropTypes;
