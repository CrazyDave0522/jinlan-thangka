import { createRoot } from "react-dom/client";
import { ChatInterface } from "../../src/components/chat/chat-interface";
import type { ChatMessage } from "../../src/components/chat/chat-message";
import "./styles.css";

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8l8AAAAASUVORK5CYII=";
const exchange: ChatMessage[] = [
  { id: "question", role: "user", text: "合成测试问题：请介绍图片的题材。", image: { src: pixel, alt: "合成测试图片", width: 180, height: 240 } },
  { id: "answer", role: "assistant", text: "合成测试回答：无法确认具体作品。", evidence: "这是布局测试内容，不是真实档案。", generalKnowledge: "通用知识测试内容。", sourceLabel: "合成来源，仅供测试" },
];
const params = new URLSearchParams(location.search);
const mode = params.get("mode");
let messages: ChatMessage[] = [];
if (mode === "populated") messages = exchange;
if (mode === "long") messages = Array.from({ length: 20 }, (_, index) => exchange.map((message) => ({ ...message, id: `${message.id}-${index}`, text: `${message.text}\n${"长内容".repeat(100)}${"LongToken".repeat(60)}` }))).flat();
if (mode === "broken") messages = [{ ...exchange[0], id: "broken", role: "user", text: "图片失败后仍保留的问题", image: { src: "/missing-test-image.png", alt: "无法加载的测试图片", width: 180, height: 240 } }];

createRoot(document.getElementById("root")!).render(<ChatInterface messages={messages} />);
