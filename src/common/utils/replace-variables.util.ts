const replaceVariables = (
  template: string,
  data: Record<string, any>,
): string => {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => data[key] ?? `{{${key}}}`,
  );
};

export { replaceVariables };
