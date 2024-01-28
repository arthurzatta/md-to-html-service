import chalk from "chalk";

export default class Logger {
  private static currentTime() {
    return new Date().toLocaleString("br");
  }

  static info(message: string) {
    const text = chalk.blue(`[INFO ${this.currentTime()}]: ${message}`);
    console.log(text);
  }

  static error(message: string) {
    const text = chalk.red(`[ERROR ${this.currentTime()}]: ${message}`);
    console.log(text);
  }

  static warn(message: string) {
    const text = chalk.yellow(`[WARN ${this.currentTime()}]: ${message}`);
    console.log(text);
  }
}
