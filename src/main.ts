import { Command } from "commander";
import * as fs from "node:fs";
import * as fsPromise from "node:fs/promises";
import path from "path";
import { version } from "../package.json";
import IEventResult from "./IEventResult";
import Logger from "./Logger";
import Observer from "./Observer";
import Parser from "./Parser";
import { Events } from "./enums/Events.enum";

function isDir(path: string): boolean {
  return fs.existsSync(path);
}

const observer = new Observer();

async function addFile(filePath: string): Promise<void> {
  const mdContent = (await fsPromise.readFile(filePath)).toString();
  const htmlContent = await new Parser().parse(mdContent);
  const fileName = filePath.split("/");
  const htmlFile = fileName[fileName.length - 1].replace(".md", ".html");
  const htmlPath = path.join(__dirname, "..", "..", "posts", htmlFile);

  const createStream = fs.createWriteStream(htmlPath);
  createStream.write(htmlContent);
  createStream.end();
}

observer.on(Events.FILE_ADDED, async (log: IEventResult) => {
  Logger.info(log.message);
  if (log.filePath.includes(".md")) {
    addFile(log.filePath);
  } else if (log.filePath.includes(".html")) {
    Logger.info(`File ${log.filePath} parsed from md to html`);
  }
});

observer.on(Events.FILE_REMOVED, async (log: IEventResult) => {
  Logger.info(log.message);
  const fileName = log.filePath.split("/");
  const htmlFile = fileName[fileName.length - 1].replace(".md", ".html");
  const htmlPath = path.join(__dirname, "..", "..", "posts", htmlFile);
  await fsPromise.rm(htmlPath, { force: false, recursive: false });
});

observer.on(Events.FILE_MODIFIED, (log: IEventResult) => {
  Logger.info(log.message);
  addFile(log.filePath);
});

const program = new Command();
program
  .version(version, "-v, --version")
  .name("posts-service")
  .description("CLI to check for Markdown files in a folder and convert to HTML.")
  .option("-d --dir <directory>", "Define the diretory to observe modifications")
  .option("-o --outdir <directory>", "Define the diretory to save the convertions")
  .parse(process.argv);
const options = program.opts();

try {
  if (!(options.dir && isDir(options.dir))) throw new Error(`Directory ${options.dir} not found`);
  if (!(options.outdir && isDir(options.outdir))) throw new Error(`Out Directory ${options.outdir} not found`);
  observer.watchFolder(options.dir);
  observer.watchFolder(options.outdir);
  observer.watchRemovals(options.dir);
  observer.watchFileModification(options.dir);
} catch (error) {
  Logger.error((error as Error).message as string);
  process.exit(1);
}
