// To use these fonts, download the DMSans font family from Google Fonts:
// https://fonts.google.com/specimen/DM+Sans
// And place the following files in this directory:
// - DMSans-Regular.ttf
// - DMSans-Medium.ttf
// - DMSans-Bold.ttf

export const fonts = {
  'DMSans-Regular': require('./DMSans-Regular.ttf'),
  'DMSans-Medium': require('./DMSans-Medium.ttf'),
  'DMSans-Bold': require('./DMSans-Bold.ttf'),
};

// Usage instructions:
// 1. Download font files from Google Fonts
// 2. Place them in this directory
// 3. In App.tsx, import the fonts:
//
// import * as Font from 'expo-font';
// import { fonts } from './src/assets/fonts';
//
// 4. Load fonts in useEffect:
//
// useEffect(() => {
//   async function loadFonts() {
//     await Font.loadAsync(fonts);
//     setFontsLoaded(true);
//   }
//   loadFonts();
// }, []);