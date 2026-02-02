import { useContext, createContext } from 'react';

export const WallpaperContext = createContext<boolean>(false);

export const useWallpaperView = () => {
  return useContext(WallpaperContext);
};
