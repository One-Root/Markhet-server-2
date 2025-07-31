const formatMobileNumber = (number: string): string => {
  const cleanedNumber = number.replace(/\D/g, '');

  if (cleanedNumber.length === 10) {
    return `+91${cleanedNumber}`;
  }

  if (cleanedNumber.startsWith('91') && cleanedNumber.length === 12) {
    return `+91${cleanedNumber.slice(2)}`;
  }

  return number;
};

export { formatMobileNumber };
