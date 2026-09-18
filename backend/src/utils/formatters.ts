export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

/** 填充错误消息/日志模板里的 {name} 占位。 */
export const fillTemplate = (template: string, params: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  );
