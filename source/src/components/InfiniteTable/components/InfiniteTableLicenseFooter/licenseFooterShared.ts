/**
 * Framework-agnostic parts of the license footer,
 * shared by the React and Vue footers.
 */
import { decamelize } from '../../../utils/decamelize';
import { ThemeVars } from '../../vars.css';

export const LICENSE_FOOTER_LINK = 'https://infinite-table.com';
export const LICENSE_FOOTER_INVALID_MESSAGE =
  'Invalid Infinite Table license. See console for details.';

type StyleMap = Record<string, string>;

const baseFooterStyle: StyleMap = {
  padding: ThemeVars.spacing[2],
  textAlign: 'end',
  opacity: '1',
  visibility: 'visible',
  display: 'block',
  fontSize: '0.85rem',
};

const missingFooterStyle: StyleMap = {
  ...baseFooterStyle,
  background: 'white',
  color: 'black',
};

const invalidFooterStyle: StyleMap = {
  ...baseFooterStyle,
  // pale red, with dark red text
  background: '#fee2e2',
  color: '#991b1b',
};

const baseAnchorStyle: StyleMap = {
  opacity: '1',
  visibility: 'visible',
  display: 'inline-block',
  pointerEvents: 'all',
  textDecoration: 'underline',
};

const missingAnchorStyle: StyleMap = { ...baseAnchorStyle, color: 'black' };
const invalidAnchorStyle: StyleMap = { ...baseAnchorStyle, color: '#991b1b' };

export function getLicenseFooterStyles(invalid: boolean) {
  return invalid
    ? { footer: invalidFooterStyle, anchor: invalidAnchorStyle }
    : { footer: missingFooterStyle, anchor: missingAnchorStyle };
}

const enforceStyle = (node: HTMLElement | null, style: StyleMap) => {
  if (!node) {
    // TODO protect against Footer node removal
    return;
  }
  for (const [propertyName, propertyValue] of Object.entries(style)) {
    node.style.setProperty(
      decamelize(propertyName),
      propertyValue,
      'important',
    );
  }
};

/**
 * Re-applies the footer styles every second, so the footer
 * cannot be hidden by overriding its styles.
 *
 * Returns a cleanup function.
 */
export function enforceLicenseFooterStyle(
  getNode: () => HTMLElement | null,
  invalid: boolean,
) {
  const styles = getLicenseFooterStyles(invalid);

  const forceStyle = () => {
    setTimeout(() => {
      const node = getNode();
      enforceStyle(node, styles.footer);
      enforceStyle(node?.querySelector('a') ?? null, styles.anchor);
    });
  };

  forceStyle();

  const intervalId = setInterval(forceStyle, 1000);

  return () => {
    clearInterval(intervalId);
  };
}
