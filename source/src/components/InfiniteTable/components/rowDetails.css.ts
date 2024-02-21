import { recipe } from '@vanilla-extract/recipes';
import { ThemeVars } from '../theme.css';

export const RowDetailsRecipe = recipe({
  base: {
    background: ThemeVars.components.RowDetails.background,
    padding: ThemeVars.components.RowDetails.padding,
  },
});
