import { theme as antdTheme, type ThemeConfig } from 'antd';
import type { ColorTheme } from './providers/theme-provider';

export const elexvxTheme = (theme: ColorTheme): ThemeConfig => {
  const dark = theme === 'dark';

  return {
    algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: dark ? '#ffffff' : '#1d1d1f',
      colorInfo: dark ? '#ffffff' : '#0066cc',
      colorLink: dark ? '#ffffff' : '#0066cc',
      colorText: dark ? '#ffffff' : '#1d1d1f',
      colorTextSecondary: dark ? '#b3b3b3' : '#6e6e73',
      colorBgBase: dark ? '#000000' : '#ffffff',
      colorBgContainer: dark ? '#000000' : '#ffffff',
      colorBorder: dark ? '#343434' : '#d2d2d7',
      borderRadius: 16,
      controlHeight: 44,
      fontFamily:
        '"OpenAI Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
      fontSize: 17,
    },
    components: {
      Button: {
        borderRadius: 16,
        boxShadow: 'none',
        primaryShadow: 'none',
        colorPrimary: dark ? '#ffffff' : '#1d1d1f',
        primaryColor: dark ? '#000000' : '#ffffff',
      },
    },
  };
};
