import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../vars.css';

export const RowDetailRecipe = recipe({
  base: {
    background: ThemeVars.components.RowDetail.background,
    padding: ThemeVars.components.RowDetail.padding,
  },
});
