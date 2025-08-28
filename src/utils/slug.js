const getSlug = (title) => {
  const timeStamp = Date.now();
  const slug =
    String(title).toLowerCase().trim().replace(/\s+/g, "-") + "-" + timeStamp;

  return { slug };
};

export {
    getSlug,
}
