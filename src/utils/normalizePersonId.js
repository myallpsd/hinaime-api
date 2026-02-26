const normalizePersonId = (id, defaultType) => {
  if (!id) return id;
  if (id.includes(':')) return id;
  if (id.startsWith('character/')) return id.replace('character/', 'character:');
  if (id.startsWith('people/')) return id.replace('people/', 'people:');
  return `${defaultType}:${id}`;
};

export default normalizePersonId;
