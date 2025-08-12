import 'styled-components';
import { light } from './src/themes';

declare module 'styled-components' {
  type MyTheme = typeof light;
  interface DefaultTheme extends MyTheme {}
}
