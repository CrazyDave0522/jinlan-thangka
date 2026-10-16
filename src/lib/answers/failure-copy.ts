import type { ChatErrorCode } from "./contracts";
export function failureCopy(code?: ChatErrorCode) {
  switch (code) {
    case "generation_unavailable": return "AI 服务暂未开启，暂时无法回复。";
    case "provider_unavailable": return "AI 服务暂时不可用，请稍后再试。";
    case "image_understanding_unavailable": return "图片解读暂未接入，请先发送纯文字问题。";
    case "context_too_large": return "文字或对话上下文过大，请缩短问题；如历史已达上限，请刷新后重新开始。刷新会清空当前全部对话、图片和草稿。";
    case "evidence_too_large": return "检索依据过多，请缩小问题范围后重新发送。";
    case "retrieval_failed": return "数据库检索失败，本次未生成回答。请稍后重新提问。";
    case "invalid_model_output": return "AI 回答未通过校验，本次未展示。请调整问题后重新发送。";
    case "invalid_image": return "图片内容无法使用，请重新选择 JPG/JPEG 或 PNG 图片。";
    case "invalid_request": case "unsupported_media_type": return "消息格式无法使用，请调整后重新发送。";
    default: return "发送失败，请重试。";
  }
}
