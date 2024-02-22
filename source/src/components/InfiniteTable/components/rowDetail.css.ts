import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../theme.css';

export const RowDetailRecipe = recipe({
  base: {
    background: ThemeVars.components.RowDetail.background,
    padding: ThemeVars.components.RowDetail.padding,
  },
});
