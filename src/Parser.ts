import marked from "marked";

export default class Parser {
  public async parse(mdContent: string): Promise<string> {
    return marked.parse(mdContent);
  }
}
