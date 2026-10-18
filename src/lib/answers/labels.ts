export const FIELD_LABELS: Record<string, string> = {
  id: "记录编号", display_name: "姓名", name_bo: "藏文姓名", name_en: "英文姓名", aliases: "别名", gender: "性别",
  birth_period_text: "出生时期", death_period_text: "去世时期", region_text: "地区", styles: "风格", institutions: "机构",
  teachers_text: "师承", active_period_text: "活跃时期", biography: "生平", official_url: "官方网站", collected_by: "采集者",
  collected_on: "采集日期", review_status: "核验状态", notes: "备注", created_at: "创建时间", updated_at: "更新时间",
  title: "标题", title_bo: "藏文标题", title_en: "英文标题", alternative_titles: "其他标题", attribution_status: "归属状态",
  attribution_notes: "归属说明", creation_period_text: "创作时期", creation_year_start: "最早创作年份", creation_year_end: "最晚创作年份",
  dating_notes: "断代说明", subject_primary: "主要题材", subject_details: "题材细节", iconography_notes: "图像学说明",
  materials_text: "材料", technique_text: "技法", height_cm: "高度（厘米）", width_cm: "宽度（厘米）", dimensions_notes: "尺寸说明",
  collection_name: "收藏机构", accession_number: "藏品编号", collection_location: "收藏地点", provenance_notes: "流传说明", description: "作品说明",
  artwork_id: "作品编号", artist_id: "艺术家编号", role: "创作角色", storage_locator: "图片位置",
  image_type: "图片类型", is_primary: "主要图片", caption: "图片说明", photographer_or_provider: "摄影者或提供方",
  rights_status: "权利状态", license_or_permission_reference: "授权依据", permission_notes: "授权说明", quality_notes: "图片质量说明",
  sha256: "图片校验值", pixel_width: "像素宽度", pixel_height: "像素高度", mime_type: "文件类型", byte_size: "文件大小",
};
export const ROLE_LABELS: Record<string, string> = { creator: "创作者", collaborator: "合作者", workshop_of: "工作室", circle_of: "艺术圈", other: "其他" };
export const NOTICE_TEXT = {
  no_retrieval: "本次为通用知识交流，未检索数据库。",
  no_matches: "数据库未找到匹配记录，以下内容不代表数据库结论。",
  record_only: "部分依据仅为数据库记录，尚无对应字段的外部来源确认。",
  candidate_limit: "检索候选已达上限，结果不代表完整档案。",
  uncertain_records: "引用记录存在待核验或归属不确定的信息，请结合来源核实。",
  image_history_omitted: "本次回答仅依据文字与数据库记录，未读取历史图片。",
} as const;
const ENUM_LABELS: Record<string, string> = {
  pending: "待核验", verified: "已核验", disputed: "有争议", not_recorded: "未记录", confirmed: "已确认", attributed: "推定归属",
  workshop: "工作室", circle_or_school: "艺术圈或流派", unknown: "未知", male: "男性", female: "女性", other: "其他", not_stated: "未说明",
  full: "全图", detail: "局部", inscription: "题记", back: "背面", mounting: "装裱", public_domain: "公有领域", authorized: "已授权",
  open_license: "开放许可", copyrighted: "受版权保护", ...ROLE_LABELS,
};
export function fieldValueLabel(field: string, value: string | number | boolean | string[] | null) {
  if (value === null || (Array.isArray(value) && !value.length)) return "未记录";
  if (typeof value === "boolean") return value ? "是" : "否";
  if (Array.isArray(value)) return value.join("、");
  if (["role", "gender", "review_status", "attribution_status", "image_type", "rights_status"].includes(field)) return ENUM_LABELS[String(value)] ?? String(value);
  return String(value);
}
