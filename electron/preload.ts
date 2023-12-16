import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  nativeTheme,
  OpenExternalOptions,
  shell,
  webFrame,
} from 'electron';
import { ElectronAPI } from './electronAPI.d';

const electronAPI: Partial<ElectronAPI> = {
  // TODO use full interface
  // const electronAPI: ElectronAPI = {

  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),

  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

  off: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.off(channel, listener),

  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on(channel, listener),

  once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.once(channel, listener),

  setZoomFactor: (zoomFactor: number) => {
    webFrame.setZoomFactor(zoomFactor);
  },
  getZoomFactor: () => webFrame.getZoomFactor(),
  openPath: (path: string) => shell.openPath(path),
  openExternal: (url: string, options?: OpenExternalOptions) => shell.openExternal(url),
  isMacOS: () => process.platform === 'darwin',

  isSystemDarkMode: () => nativeTheme.shouldUseDarkColors,

  getUserDataPath: () => ipcRenderer.invoke('GET_PATH', 'userData'),
  relaunch: () => ipcRenderer.send('RELAUNCH'),
  exit: () => ipcRenderer.send('EXIT'),
  reloadMainWin: () => ipcRenderer.send('RELOAD_MAIN_WIN'),
  openDevTools: () => ipcRenderer.send('OPEN_DEV_TOOLS'),

  // ALL EVENTS
  scheduleRegisterBeforeClose: (id) => ipcRenderer.send('REGISTER_BEFORE_CLOSE', { id }),
  unscheduleRegisterBeforeClose: (id) =>
    ipcRenderer.send('UNREGISTER_BEFORE_CLOSE', { id }),
  setDoneRegisterBeforeClose: (id) => ipcRenderer.send('BEFORE_CLOSE_DONE', { id }),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// contextBridge.exposeInIsolatedWorld();
console.log('preload script loading complete');