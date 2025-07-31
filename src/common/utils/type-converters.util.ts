const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;

  const result = parseInt(value, 10);

  return isNaN(result) ? undefined : result;
};

const toFloat = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;

  const result = parseFloat(value);

  return isNaN(result) ? undefined : result;
};

const toDate = (value: string | undefined): Date | undefined =>
  value ? new Date(value) : undefined;

const toBoolean = (value: string | undefined): boolean | undefined =>
  value ? value === '1' || value.toLowerCase() === 'true' : undefined;

export { toDate, toFloat, toNumber, toBoolean };
