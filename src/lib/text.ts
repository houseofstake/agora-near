export const truncateString = (str: string, maxLength: number) => {
  return str.length > maxLength ? `${str.substring(0, maxLength - 3)}...` : str;
};

export const cleanString = (text: string) => {
  return text
    .replace(/#{1,6}\s/g, "") // Removes Markdown headings
    .replace(/\n/g, " "); // Replaces newlines with space
};

export const truncateMiddle = (
  str: string,
  startLen: number = 6,
  endLen: number = 6
) => {
  if (str.length <= startLen + endLen) return str;
  return `${str.slice(0, startLen)}...${str.slice(-endLen)}`;
};

export const truncateAddress = (address: string) => {
  if (address.length <= 24) return address;
  return truncateMiddle(address, 6, 6);
};
