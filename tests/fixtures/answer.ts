import { canonical, type AssistantMessage } from "../../src/lib/answers/contracts";
export function assistant(text = "测试回答", id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"): AssistantMessage {
  const message: AssistantMessage = { id, role: "assistant", kind: "answer", text: "", blocks: [{ kind: "general", text, evidenceKeys: [] }], references: [], notices: [] };
  message.text = canonical(message);
  return message;
}
