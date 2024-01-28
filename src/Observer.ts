import chokidar from "chokidar";
import { EventEmitter } from "events";
import { Events } from "./enums/Events.enum";

export default class Observer extends EventEmitter {
  constructor() {
    super();
  }

  watchFolder(folder: string) {
    const watcher = chokidar.watch(folder, { persistent: true });
    watcher.on("add", (filePath: string) => {
      this.emit(Events.FILE_ADDED, { message: `File ${filePath} has been added`, filePath });
    });
  }

  watchRemovals(folder: string) {
    const watcher = chokidar.watch(folder, { persistent: true });
    watcher.on("unlink", async (filePath: string) => {
      this.emit(Events.FILE_REMOVED, { message: `File ${filePath} has been removed`, filePath });
    });
  }

  watchFileModification(folder: string) {
    const watcher = chokidar.watch(folder, { persistent: true });
    watcher.on("change", (filePath) => {
      this.emit(Events.FILE_MODIFIED, { message: `File ${filePath} modified`, filePath });
    });
  }
}
