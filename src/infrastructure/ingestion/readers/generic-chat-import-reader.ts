import type { ImportedChat } from "../../../core/chat-import/imported-chat";
import type { ProviderReader, ReaderParseInput } from "./parsing-helpers";
import { parseGenericInput } from "./parsing-helpers";

export class GenericChatImportReader implements ProviderReader {
  parse(input: ReaderParseInput): ImportedChat[] {
    return parseGenericInput(input);
  }
}
